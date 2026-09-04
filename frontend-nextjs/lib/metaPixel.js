export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '2289821805188406';

/**
 * Safe client-side wrapper to trigger Meta Pixel standard and custom events.
 * Supports passing `eventId` for server-side Conversions API (CAPI) deduplication.
 *
 * @param {string} eventName Name of standard or custom event (e.g. 'PageView', 'AddToCart', 'Purchase')
 * @param {Object} [params={}] Additional event parameters (value, currency, content_ids, etc.)
 * @param {string|null} [eventId=null] Unique event ID matching backend CAPI event_id for automatic deduplication
 */
export const trackEvent = (eventName, params = {}, eventId = null) => {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    if (eventId) {
      // Pass eventID as 4th parameter for Meta deduplication
      window.fbq('track', eventName, params, { eventID: String(eventId) });
    } else {
      window.fbq('track', eventName, params);
    }
  } else {
    // If pixel is still loading, queue or log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Meta Pixel] fbq not defined yet when tracking "${eventName}"`);
    }
  }
};

/**
 * Standard PageView event
 */
export const trackPageView = () => {
  trackEvent('PageView');
};

/**
 * Standard AddToCart event
 */
export const trackAddToCart = ({ id, name, price, currency = 'INR', quantity = 1 }) => {
  trackEvent('AddToCart', {
    content_ids: [String(id)],
    content_name: name,
    content_type: 'product',
    value: Number(price) * quantity,
    currency: currency,
  });
};

/**
 * Standard InitiateCheckout event
 */
export const trackInitiateCheckout = ({ items = [], totalValue = 0, currency = 'INR' }) => {
  const contentIds = items.map((i) => String(i.productId || i._id || i.id));
  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents: items.map((i) => ({
      id: String(i.productId || i._id || i.id),
      quantity: i.quantity || 1,
      item_price: Number(i.price || 0),
    })),
    num_items: items.length,
    value: Number(totalValue),
    currency: currency,
  });
};

/**
 * Standard Purchase event with deduplication eventId
 */
export const trackPurchase = ({ orderId, items = [], totalValue = 0, currency = 'INR' }) => {
  const contentIds = items.map((i) => String(i.productId || i._id || i.id));
  trackEvent(
    'Purchase',
    {
      content_ids: contentIds,
      contents: items.map((i) => ({
        id: String(i.productId || i._id || i.id),
        quantity: i.quantity || 1,
        item_price: Number(i.price || 0),
      })),
      num_items: items.length,
      value: Number(totalValue),
      currency: currency,
    },
    orderId // Critical: eventID for Meta CAPI deduplication
  );
};
