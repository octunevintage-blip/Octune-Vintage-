import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const coupons = await mongoose.connection.collection('coupons').find({ code: { $not: /^COMP-/i } }).toArray();
  console.log(JSON.stringify(coupons.map(c => c.code)));
  process.exit(0);
});
