import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import TempUser from '../models/TempUser.js';
import { sendSMS } from '../utils/smsService.js';
import sendEmail, { otpEmailTemplate } from '../utils/sendEmail.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    res.status(400);
    throw new Error('Phone number is already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user directly
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please log in to your account.',
    });
  } else {
    res.status(400);
    throw new Error('Failed to complete registration');
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) {
    res.status(400);
    throw new Error('OTP has expired or registration session not found');
  }

  tempUser.attempts += 1;
  await tempUser.save();

  if (tempUser.attempts > 5) {
    await TempUser.deleteOne({ _id: tempUser._id });
    res.status(400);
    throw new Error('Too many incorrect attempts. Please sign up again.');
  }

  if (tempUser.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  const emailExists = await User.findOne({ email: tempUser.email });
  if (emailExists) {
    await TempUser.deleteOne({ _id: tempUser._id });
    res.status(400);
    throw new Error('Email is already registered');
  }

  const phoneExists = await User.findOne({ phone: tempUser.phone });
  if (phoneExists) {
    await TempUser.deleteOne({ _id: tempUser._id });
    res.status(400);
    throw new Error('Phone number is already registered');
  }

  const user = await User.create({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: tempUser.password, // already hashed
  });

  if (user) {
    await TempUser.deleteOne({ _id: tempUser._id });
    res.status(201).json({
      success: true,
      message: 'Registration verified successfully! Please log in to your account.',
    });
  } else {
    res.status(400);
    throw new Error('Failed to complete registration');
  }
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) {
    res.status(400);
    throw new Error('Registration session has expired. Please sign up again.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  tempUser.otp = otp;
  tempUser.attempts = 0;
  tempUser.createdAt = new Date();
  await tempUser.save();

  await sendSMS(tempUser.phone, otp);
  await sendEmail({
    to: tempUser.email,
    subject: 'Verify Your Octune Vintage Account',
    html: otpEmailTemplate(otp),
  });

  res.status(200).json({
    message: 'OTP resent successfully',
  });
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    setTokenCookie(res, token, 'token');
    res.json({ _id: user._id, name: user.name, email: user.email, token });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (admin && (await admin.matchPassword(password))) {
    const token = generateToken(admin._id);
    setTokenCookie(res, token, 'adminToken');
    res.json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, token });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('adminToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      addresses: user.addresses || [],
      wishlist: user.wishlist || [],
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  if (req.body.addresses) {
    user.addresses = req.body.addresses;
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone || '',
    addresses: updatedUser.addresses || [],
  });
});
