import mongoose from 'mongoose';

const hotspotSchema = new mongoose.Schema({
  top: { type: Number, required: true },
  left: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}, { _id: false });

const lookSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  hotspots: [hotspotSchema]
});

const contentSchema = new mongoose.Schema({
  hero: {
    image: { type: String, required: true, default: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop' },
    title: { type: String, required: true, default: 'OWN AN ICON' }
  },
  heroBanners: {
    type: [{
      image: { type: String, required: true },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      linkText: { type: String, default: '' },
      linkUrl: { type: String, default: '' }
    }],
    default: [
      {
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
        title: 'OWN AN ICON',
        subtitle: 'The Vintage Collection',
        linkText: 'SHOP NOW',
        linkUrl: '/shop'
      }
    ]
  },
  splitBanners: {
    type: [{
      image: { type: String, required: true },
      title: { type: String, required: true },
      linkCategory: { type: String, required: true }
    }],
    default: [
      {
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
        title: 'JACKETS',
        linkCategory: 'Jackets'
      },
      {
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
        title: 'TRACKTOPS',
        linkCategory: 'Tracktops'
      }
    ]
  },
  customBanners: {
    type: [{
      image: { type: String, required: true },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      linkText: { type: String, default: '' },
      linkUrl: { type: String, default: '' }
    }],
    default: []
  },
  trendingProducts: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    default: []
  },
  newArrivals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    default: []
  },
  vintageClassics: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    default: []
  },
  archivePicks: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    default: []
  },
  looks: {
    type: [lookSchema],
    default: [
      {
        id: 'look-1',
        image: 'https://images.unsplash.com/photo-1523398002811-999aa8d9511e?q=80&w=1000&auto=format&fit=crop',
        title: 'L01 — ARCHIVE FIT',
        hotspots: []
      }
    ]
  }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
