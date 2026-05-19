import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['superadmin', 'manager'],
    default: 'manager'
  }
}, {
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
