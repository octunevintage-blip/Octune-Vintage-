import mongoose from 'mongoose';
import validator from 'validator';
import crypto from 'crypto';

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  source: {
    type: String,
    enum: ['footer', 'drop-page', 'product-page'],
    default: 'footer'
  },
  isActive: { type: Boolean, default: true },
  unsubscribeToken: { type: String }
}, {
  timestamps: true
});

subscriberSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomUUID();
  }
  next();
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
