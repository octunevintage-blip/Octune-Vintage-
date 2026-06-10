import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    const coupons1 = await Coupon.find({ restrictedToEmail: { $in: [null, '', undefined] } });
    console.log('Query 1 matched:', coupons1.length);
    
    const coupons2 = await Coupon.find({
      $or: [
        { restrictedToEmail: { $exists: false } },
        { restrictedToEmail: null },
        { restrictedToEmail: "" }
      ]
    });
    console.log('Query 2 matched:', coupons2.length);

  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
