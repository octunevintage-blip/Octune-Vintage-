import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    size: String,
    color: String,
    price: Number
  },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    size: String,
    color: String,
    price: Number
  }],
  shippingAddress: {
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  coupon: {
    code: String,
    discount: Number
  },
  payment: {
    method: { type: String, default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  tracking: {
    provider: String,
    number: String,
    url: String
  },
  notes: String
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
