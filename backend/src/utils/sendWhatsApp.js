import axios from 'axios';

/**
 * Utility to send WhatsApp Template Messages via Meta Cloud API
 * 
 * Requires the following Environment Variables in .env:
 * WHATSAPP_ACCESS_TOKEN = Your Meta Permanent Access Token
 * WHATSAPP_PHONE_ID = Your Meta Phone Number ID
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

export const sendWhatsAppMessage = async ({ to, type, data }) => {
  try {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      console.warn('WhatsApp API credentials are not set. Skipping message to:', to);
      return false;
    }

    // Format phone number (remove +, spaces, or leading zeros)
    let formattedPhone = to.replace(/[\s\-\+]/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // Default to India +91 if only 10 digits
    }

    let templateName = '';
    let components = [];

    switch (type) {
      case 'order_confirmation':
        templateName = 'order_success_template'; // Replace with approved Meta template name
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.orderNumber }
            ]
          }
        ];
        break;

      case 'tracking_update':
        templateName = 'order_tracking_template';
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.orderNumber },
              { type: 'text', text: data.trackingId }
            ]
          }
        ];
        break;

      case 'custom_coupon':
        templateName = 'custom_coupon_template';
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.code },
              { type: 'text', text: data.discountText }
            ]
          }
        ];
        break;

      case 'welcome_message':
        templateName = 'welcome_template';
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName }
            ]
          }
        ];
        break;

      case 'back_in_stock':
        templateName = 'back_in_stock_template';
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.productName },
              { type: 'text', text: data.productUrl }
            ]
          }
        ];
        break;

      default:
        throw new Error('Invalid WhatsApp message type');
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: components
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`WhatsApp message sent to ${formattedPhone}. Message ID: ${response.data.messages[0].id}`);
    return true;

  } catch (error) {
    console.error('Failed to send WhatsApp message:', error.response?.data || error.message);
    // Don't throw error to avoid breaking main flows (e.g. order creation)
    return false;
  }
};

export default sendWhatsAppMessage;
