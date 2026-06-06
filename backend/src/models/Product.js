import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: "" },
  shortDescription: { type: String, maxLength: 200 },
  category: { 
    type: String, 
    enum: ['Jackets', 'Tracktops', 'Trackpants', 'Jerseys', 'Shorts'],
    required: true,
    index: true
  },
  brand: { type: String },
  size: { type: String, required: true },
  color: {
    name: { type: String },
    hex: { type: String }
  },
  price: { type: Number, required: true },
  mrp: { type: Number },
  images: {
    type: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }],
    validate: [v => v.length >= 1, 'At least one image is required']
  },
  material: { type: String },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Used'],
    default: 'Used'
  },
  era: { type: String },
  measurements: {
    chest: String,
    length: String,
    shoulder: String,
    sleeve: String,
    waist: String,
    thighWidth: String,
    bottomWidth: String,
    inseam: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'available', 'reserved', 'sold', 'archived', 'out-of-stock'],
    default: 'available',
    index: true
  },
  dropAt: { type: Date, index: true },
  dropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drop' },
  reservedUntil: { type: Date },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldAt: { type: Date, index: true },
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  deleteAt: { type: Date, index: true },
  seo: {
    metaTitle: String,
    metaDescription: String
  },
  views: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  waitlist: [{
    email: { type: String, required: true },
    phone: { type: String },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('hoursSinceSold').get(function() {
  if (!this.soldAt) return 0;
  return Math.floor((Date.now() - this.soldAt.getTime()) / (1000 * 60 * 60));
});

productSchema.virtual('isLive').get(function() {
  return !this.dropAt || this.dropAt <= Date.now();
});

productSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(`${this.name}-${Date.now()}`, { lower: true, strict: true });
  }
  
  if (this.status === 'upcoming' && this.dropAt && this.dropAt <= Date.now()) {
    this.status = 'available';
  }

  if (this.status === 'out-of-stock') {
    if (!this.deleteAt) {
      this.deleteAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days in future
    }
  } else {
    // If they change it back to available or other active statuses, clear the auto-delete timestamp
    if (this.isModified('status') && this.status !== 'sold') {
      this.deleteAt = undefined;
    }
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
