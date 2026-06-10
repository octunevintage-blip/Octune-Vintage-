import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    const c = await Coupon.create({
      code: 'COMP-TEST',
      type: 'flat',
      value: 100,
      usageLimit: 1,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      restrictedToEmail: 'test@test.com',
      restrictedToPhone: '1234567890'
    });
    console.log('SUCCESS', c);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
