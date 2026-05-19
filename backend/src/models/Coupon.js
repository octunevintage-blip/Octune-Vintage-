import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['flat', 'percent'],
    required: true
  },
  value: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
