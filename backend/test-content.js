import mongoose from 'mongoose';
import Content from './src/models/Content.js';

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/octunevintage');
    let c = await Content.findOne();
    if(!c) c = await Content.create({});
    c.ourPeoples = [{ image: 'test.png', title: 'test' }];
    c.markModified('ourPeoples');
    await c.save();
    const c2 = await Content.findOne();
    console.log('Saved:', c2.ourPeoples);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
