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
  upcomingBanner: {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    title: { type: String, default: 'UPCOMING EXCLUSIVE DROP' },
    subtitle: { type: String, default: 'Stay tuned! Dropping soon.' },
    bannerImage: { type: String, default: '' }
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
  },
  about: {
    title: { type: String, default: 'About Us' },
    quote: { type: String, default: '"Our best picks of your favourite brands! That’s pretty much what Octune Vintage is all about!"' },
    description: { 
      type: String, 
      default: 'We’re a thrifted/second-hand clothing store from West Bengal, India, built around timeless fashion and sustainable shopping! At Octune, we curate pre-loved and vintage pieces that bring style, comfort, and a whole lot of personality to your wardrobe.\n\nThink vintage jackets, windbreakers, track tops, jerseys, T-shirts, shorts, pants, and honestly, anything cool we can get our hands on! We only stock one piece of each product. So when you add something to your cart, you know it’s gonna be one of a kind!\n\nNow, who’s behind Octune?\n\nMeet Rubai, the curator with all the right finds! He’s technically behind sourcing all these cool pieces that you guys fight over! He’s absolutely obsessed with anything retro; be it fashion, bikes or music! Every product is handpicked and checked carefully, because looking good is important, but quality matters just as much. We make sure each piece is sourced with authenticity checks and is in A1 condition.\n\nThen there’s Rupsa, the social media fairy! She’s the one who decides what goes into a drop and that all the displayed products are squeaky clean, sorted and ready to go! From managing the drops to making sure your parcel reaches you smoothly, she handles the behind-the-scenes chaos so your Octune experience feels seamless from start to finish.\n\nAlso let’s not forget our Minati didi! Our super sweet didi who sorts our inventory, irons the products and makes sure that what we display are up to the mark!\n\nAnd of course, we have Simba, our golden CEO. He may not pack orders or help the customers or handpick items or manage social media…wait a sec, why do we have him again? Oh.. he got the job with his absolute cuteness!'
    },
    image: { type: String, default: '/about_us_photo.png' }
  }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
