import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    const all = await Coupon.find({});
    console.log('Total Coupons:', all.length);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
