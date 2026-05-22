import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document expires in 5 minutes (300 seconds)
  },
}, {
  timestamps: true,
});

// Remove existing indexes and establish the single-field TTL index on createdAt
tempUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const TempUser = mongoose.model('TempUser', tempUserSchema);

export default TempUser;
