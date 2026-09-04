import crypto from 'crypto';

/**
 * Normalizes and hashes a string value using SHA-256 as required by Meta Conversions API.
 * @param {string} value
 * @returns {string|null} 64-character hex SHA-256 hash or null if empty
 */
export function hashData(value) {
  if (!value || typeof value !== 'string') return null;
  const clean = value.trim().toLowerCase();
  if (!clean) return null;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Normalizes Indian and international phone numbers for Meta (E.164 without '+' or leading zeros).
 * @param {string} phone
 * @returns {string|null} Hashed phone number
 */
export function hashPhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  // Default to Indian country code 91 if 10-digit number
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('091')) {
    digits = digits.slice(1);
  }
  return hashData(digits);
}

/**
 * Extracts a cookie value from raw Cookie header or req.cookies.
 * @param {import('express').Request} req
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(req, name) {
  if (!req) return null;
  if (req.cookies && req.cookies[name]) return req.cookies[name];
  if (req.headers && req.headers.cookie) {
    const match = req.headers.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : null;
  }
  return null;
}

/**
 * Dispatches a Purchase conversion event directly to Meta Graph API (Conversions API).
 * Enables deduplication with the client-side Meta Pixel using `event_id`.
 *
 * @param {Object} order Mongoose order document or plain order object
 * @param {import('express').Request} [req] Optional Express request object for IP and User-Agent
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendMetaPurchaseEvent(order, req = null) {
  const pixelId = process.env.META_PIXEL_ID || '2289821805188406';
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('[Meta CAPI] Warning: META_CONVERSIONS_API_ACCESS_TOKEN is not configured. Skipping server-side event.');
    return { success: false, error: 'Access token missing' };
  }

  try {
    const customer = order.customer || {};
    const shipping = order.shippingAddress || {};
    const orderTotal = order.pricing?.total ?? order.totalAmount ?? order.total ?? 0;
    const eventId = String(order.orderNumber || order._id);

    // Split customer name into first and last name if possible
    const nameParts = (customer.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Extract client metadata from request if available
    let clientIp = null;
    let userAgent = null;
    let fbp = null;
    let fbc = null;

    if (req) {
      const forwarded = req.headers['x-forwarded-for'];
      clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || req.ip || null);
      userAgent = req.headers['user-agent'] || null;
      fbp = getCookie(req, '_fbp');
      fbc = getCookie(req, '_fbc');
    }

    // Build hashed user_data according to Meta specs
    const userData = {};
    if (customer.email) userData.em = [hashData(customer.email)];
    if (customer.phone) userData.ph = [hashPhone(customer.phone)];
    if (firstName) userData.fn = [hashData(firstName)];
    if (lastName) userData.ln = [hashData(lastName)];
    if (shipping.city) userData.ct = [hashData(shipping.city)];
    if (shipping.state) userData.st = [hashData(shipping.state)];
    if (shipping.pincode) userData.zp = [hashData(shipping.pincode)];
    userData.country = [hashData('in')];

    // Non-hashed client context
    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    // Build product contents
    const productsList = order.products && order.products.length > 0
      ? order.products
      : (order.product ? [order.product] : []);

    const contents = productsList.map(p => ({
      id: String(p.productId || p._id || 'unknown'),
      quantity: 1,
      item_price: Number(p.price || 0)
    }));

    const contentIds = contents.map(c => c.id);

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId, // Critical for deduplication with browser pixel
          event_source_url: `https://octunevintage.in/order-success/${order._id}`,
          action_source: 'website',
          user_data: userData,
          custom_data: {
            currency: 'INR',
            value: Number(orderTotal),
            content_type: 'product',
            contents: contents,
            content_ids: contentIds,
            order_id: eventId
          }
        }
      ]
    };

    if (process.env.META_TEST_EVENT_CODE) {
      payload.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI Error]:', result);
      return { success: false, error: result };
    }

    console.log(`[Meta CAPI Success]: Purchase event tracked for Order ${eventId}. Meta Events Received: ${result.events_received}`);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Meta CAPI Exception]:', error.message);
    return { success: false, error: error.message };
  }
}
