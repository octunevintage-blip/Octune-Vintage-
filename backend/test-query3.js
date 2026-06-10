import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    
    // Let's create a test coupon without restrictedToEmail
    await Coupon.create({
      code: 'TEST-' + Math.random(),
      type: 'flat',
      value: 100,
      usageLimit: 100,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 1000000000)
    });

    const all = await Coupon.find({});
    console.log('Total Coupons:', all.length);

    // Test query 1
    const q1 = await Coupon.find({ restrictedToEmail: { $in: [null, ""] } });
    console.log('Query 1 matched:', q1.length);

    // Test query 2
    const q2 = await Coupon.find({ restrictedToEmail: { $exists: false } });
    console.log('Query 2 matched:', q2.length);

    // Clean up
    await Coupon.deleteMany({ code: /^TEST-/ });
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
