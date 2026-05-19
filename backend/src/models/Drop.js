import mongoose from 'mongoose';
import slugify from 'slugify';

const dropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  coverImage: {
    url: String,
    publicId: String
  },
  dropAt: { type: Date, required: true, index: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  productCount: { type: Number, default: 0 },
  notifiedAt: { type: Date }
}, {
  timestamps: true
});

dropSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(`${this.name}-${Date.now()}`, { lower: true, strict: true });
  }
  next();
});

const Drop = mongoose.model('Drop', dropSchema);
export default Drop;
