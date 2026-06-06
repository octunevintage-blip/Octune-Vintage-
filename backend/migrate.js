import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/octune-vintage');
  const Product = mongoose.model('Product', new mongoose.Schema({ category: String }, { strict: false }));
  const prods = await Product.find({ category: { $regex: /wind/i } }).select('category name');
  console.log(prods);
  await mongoose.disconnect();
}

run().catch(console.error);
