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
  },
  terms: {
    type: String,
    default: `<section><p>By accessing our website and placing an order, you agree to the following terms and conditions. Please read them carefully before making a purchase.</p></section>
<section><p>This website is an independent thrift and resale platform. References to third-party brand names, logos, labels, product names, and trademarks are made solely for the purpose of accurately identifying genuine pre-owned products. All such trademarks and intellectual property belong to their respective owners. We do not claim ownership of any third-party marks and are not affiliated with, authorised by, endorsed by, sponsored by, or officially associated with any brand displayed or mentioned on this website.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">1. Product Information</h2><p>Octune Vintage deals in thrifted, pre-loved, and vintage clothing. Most products are one-of-a-kind and available in limited quantities, usually only one piece per item. As these are pre-loved pieces, minor signs of wear, fading, or natural ageing may be present. We make every effort to mention noticeable flaws, defects, or imperfections in the product description along with images.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">2. Authenticity & Quality</h2><p>Every product is handpicked, checked, cleaned, and quality-inspected before being listed or shipped. We aim to ensure that each item meets our standards of authenticity, quality, and wearability.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">3. Sizing</h2><p>Vintage and thrifted clothing sizes may differ from modern sizing standards. Customers are advised to check the measurements provided before placing an order. Octune Vintage will not be responsible for size-related issues if measurements have been mentioned clearly.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">4. Orders & Payments</h2><p>Once an order is placed successfully, customers will receive an order confirmation. Orders are processed only after successful payment. Octune Vintage reserves the right to cancel any order due to product unavailability, payment issues, incorrect pricing, or any other unforeseen reason.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">5. Shipping & Delivery</h2><p>We offer free shipping all across India. Orders will be packed and dispatched within 3 working days. Delivery timelines may vary depending on location, courier service, weather conditions, public holidays, or other external factors. Standard shipping may take around 5-8 working days depending on transit speed and delivery location. Octune Vintage is not responsible for delays caused by courier partners once the order has been dispatched. But post shipping support; in case of delays are available; such as help with tracking and raising complaints with the courier team.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">6. Returns & Exchanges</h2><p>Since our products are thrifted and mostly one-of-a-kind pieces, returns and exchanges are not accepted. Exceptions will only be made if the customer receives the wrong item or an item with significant damage that was not mentioned in the product listing.</p><br/><p>To report an issue, customers must contact us within the specified time after delivery and provide a clear unboxing video of both the product and the packaging.</p><br/><p>The unboxing video must meet the following requirements:</p><br/><ul class="list-disc pl-5 mb-4"><li>The video must be at least 1 minute and 30 seconds long.</li><li>It must clearly show a 360-degree view of the sealed parcel before opening.</li><li>The shipping label must be clearly visible before the package is opened.</li><li>The entire video must be recorded in one continuous shot without any cuts, edits, or pauses.</li><li>The reported issue or defect must be clearly visible in the video.</li></ul><p>Requests that do not meet these requirements may not be eligible for review, return, or exchange.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">7. Colors & Images</h2><p>We make every effort to display product colors as accurately as possible. However, actual colors may vary slightly due to lighting, photography, and individual screen settings.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">8. Pricing</h2><p>All prices are listed in Indian Rupees (INR) unless stated otherwise. Prices are subject to change at any time without prior notice. However, confirmed orders will not be affected by any subsequent price changes.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">9. Customer Responsibility</h2><p>Customers are responsible for providing accurate shipping details, contact information, and confirming the correct size before placing an order. Octune Vintage will not be responsible for failed deliveries caused by incorrect or incomplete addresses or invalid phone numbers.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">10. Website Use</h2><p>All content on this website, including images, text, branding, logos, and product descriptions, is the property of Octune Vintage and may not be copied, reused, distributed, or reproduced without prior written permission.</p></section>
<section><h2 class="font-display text-xl uppercase tracking-widest mb-4 mt-8">11. Contact</h2><p>For any order-related concerns, questions, or support, customers may contact Octune Vintage at:<br/><strong>Email:</strong> octunevintage@gmail.com</p></section>`
  },
  announcement: {
    text: { type: String, default: '' },
    isActive: { type: Boolean, default: false }
  },
  nextDrop: {
    isActive: { type: Boolean, default: false },
    title: { type: String, default: 'NEXT DROP IN:' },
    targetDate: { type: Date, default: null }
  },
  faqs: {
    type: [{
      q: { type: String, required: true },
      a: { type: String, required: true }
    }],
    default: [
      { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking link via email. You can also check the tracking status in the Orders section of your account.' },
      { q: 'What is your return/refund policy?', a: 'Since our products are thrifted and mostly one-of-a-kind pieces, returns and exchanges are not accepted. Exceptions will only be made if the customer receives the wrong item or an item with significant damage that was not mentioned in the product listing.' },
      { q: 'How long does shipping take?', a: 'Domestic orders are typically delivered within 5-7 business days. We ship via trusted courier partners with full tracking.' },
      { q: 'Are your products authentic?', a: 'Yes! Every piece is 100% authentic vintage. We source globally and verify authenticity before listing. Each item is a unique 1-of-1 find.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement, provided they haven\'t been shipped yet. Contact our support team for assistance.' },
      { q: 'Do you offer international shipping?', a: 'Currently, we ship within India only. International shipping will be available soon. Stay tuned!' }
    ]
  },
  ourPeoples: {
    type: [{
      image: { type: String, required: true },
      title: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  ourPeopleContent: {
    heading: { type: String, default: 'Our Happy Customers' },
    paragraph: { type: String, default: '"You make the clothes look good."' }
  },
  sectionHeadings: {
    trendingTitle: { type: String, default: "WHAT'S TRENDING" },
    trendingSubtitle: { type: String, default: "Handpicked archives currently on fire." },
    newArrivalsTitle: { type: String, default: "NEW ARRIVALS" },
    newArrivalsSubtitle: { type: String, default: "Freshly dropped 1-of-1 vintage grails." },
    vintageClassicsTitle: { type: String, default: "VINTAGE CLASSICS" },
    vintageClassicsSubtitle: { type: String, default: "Timeless heritage pieces that never fade." },
    archivePicksTitle: { type: String, default: "ARCHIVE PICKS" },
    archivePicksSubtitle: { type: String, default: "Rare curated selections from the vault." }
  }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
