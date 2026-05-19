import cron from 'node-cron';
import Product from '../models/Product.js';
import Drop from '../models/Drop.js';
import Subscriber from '../models/Subscriber.js';
import cloudinary from '../config/cloudinary.js';
import sendEmail, { dropLiveTemplate } from './sendEmail.js';

export const startCronJobs = () => {
  console.log('Starting cron jobs...');

  // Hourly: delete products where status="sold" or "out-of-stock" AND deleteAt <= now
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const expiredProducts = await Product.find({ status: { $in: ['sold', 'out-of-stock'] }, deleteAt: { $lte: now } });
      
      if (expiredProducts.length > 0) {
        console.log(`Cron (Hourly): Found ${expiredProducts.length} expired sold/out-of-stock products to archive/delete.`);
        for (const product of expiredProducts) {
          for (const img of product.images) {
            await cloudinary.uploader.destroy(img.publicId);
          }
          await Product.findByIdAndDelete(product._id);
        }
        console.log(`Cron (Hourly): Successfully deleted ${expiredProducts.length} products and their images.`);
      }
    } catch (error) {
      console.error('Cron Error (Hourly):', error);
    }
  });

  // Every 5 mins: release reservations
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Product.updateMany(
        { status: 'reserved', reservedUntil: { $lte: now } },
        { $set: { status: 'available', reservedUntil: null, reservedBy: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Cron (5min): Released ${result.modifiedCount} expired reservations.`);
      }
    } catch (error) {
      console.error('Cron Error (5min):', error);
    }
  });

  // Every minute: Check for drops going live
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 1. Flip upcoming standalone products to available
      const upcomingResult = await Product.updateMany(
        { status: 'upcoming', dropAt: { $lte: now } },
        { $set: { status: 'available' } }
      );
      if (upcomingResult.modifiedCount > 0) {
        console.log(`Cron (1min): Flipped ${upcomingResult.modifiedCount} upcoming products to available.`);
      }

      // 2. Process drops
      const scheduledDrops = await Drop.find({ 
        status: 'scheduled', 
        dropAt: { $lte: now }, 
        notifiedAt: null 
      });

      for (const drop of scheduledDrops) {
        drop.status = 'live';
        drop.notifiedAt = now;
        await drop.save();
        
        const products = await Product.find({ dropId: drop._id });
        console.log(`Cron (1min): Drop ${drop.name} is now LIVE with ${products.length} products.`);

        const subscribers = await Subscriber.find({ isActive: true });
        if (subscribers.length > 0) {
          console.log(`Cron (1min): Sending drop live email to ${subscribers.length} subscribers.`);
          const html = dropLiveTemplate(drop, products);
          const emailPromises = subscribers.map(sub => 
            sendEmail({ to: sub.email, subject: `Octune Vintage: ${drop.name} is LIVE`, html })
          );
          const results = await Promise.allSettled(emailPromises);
          const failed = results.filter(r => r.status === 'rejected');
          if (failed.length > 0) {
            console.error(`Cron (1min): Failed to send ${failed.length} emails.`);
          }
        }
      }
    } catch (error) {
      console.error('Cron Error (1min):', error);
    }
  });
};
