import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    
    // Create public coupon
    await Coupon.create({
      code: 'TEST-PUB-' + Math.random(),
      type: 'flat',
      value: 100,
      usageLimit: 100,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 1000000000)
    });

    // Create personalized coupon
    await Coupon.create({
      code: 'TEST-PER-' + Math.random(),
      type: 'flat',
      value: 100,
      usageLimit: 100,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 1000000000),
      restrictedToEmail: 'test@example.com'
    });

    const q1 = await Coupon.find({ 
      restrictedToEmail: { $in: [null, "", undefined] },
      code: /^TEST-/
    });
    console.log('Query with undefined matched:', q1.length);
    console.log('Codes:', q1.map(c => c.code));

    // Clean up
    await Coupon.deleteMany({ code: /^TEST-/ });
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
