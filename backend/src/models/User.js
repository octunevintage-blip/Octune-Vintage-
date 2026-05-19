import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  addresses: [{
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
