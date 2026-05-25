import Product from '../models/Product.js';
import sendEmail, { backInStockEmailTemplate } from '../utils/sendEmail.js';
import sendWhatsAppMessage from '../utils/sendWhatsApp.js';

export const startInventoryCron = () => {
  // Run every 1 minute
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find products that are reserved but the reservedUntil time has passed
      const expiredProducts = await Product.find({
        status: 'reserved',
        reservedUntil: { $lt: now }
      });

      if (expiredProducts.length === 0) return;

      for (let product of expiredProducts) {
        // Revert status
        product.status = 'available';
        product.reservedUntil = undefined;
        product.reservedBy = undefined;
        
        // Notify waitlist
        if (product.waitlist && product.waitlist.length > 0) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const productUrl = `${frontendUrl}/product/${product.slug}`;

          for (let user of product.waitlist) {
            // Send Email
            if (user.email) {
              const html = backInStockEmailTemplate(product, productUrl);
              sendEmail({
                to: user.email,
                subject: `Back in Stock: ${product.name} | Octune Vintage`,
                html
              }).catch(err => console.error(`Failed to send back-in-stock email to ${user.email}:`, err.message));
            }

            // Send WhatsApp
            if (user.phone) {
              sendWhatsAppMessage({
                to: user.phone,
                type: 'back_in_stock',
                data: {
                  productName: product.name,
                  productUrl: productUrl
                }
              }).catch(err => console.error(`Failed to send back-in-stock whatsapp to ${user.phone}:`, err.message));
            }
          }

          // Clear waitlist after notifying
          product.waitlist = [];
        }

        await product.save();
        console.log(`[Inventory Cron] Auto-released stock for product: ${product.name}`);
      }
    } catch (error) {
      console.error('[Inventory Cron] Error auto-releasing stock:', error);
    }
  }, 60000); // 60,000 ms = 1 minute
};
