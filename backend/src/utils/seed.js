import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = new Admin({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin'
      });
      await admin.save();
      console.log('Superadmin created!');
    } else {
      console.log('Admin already exists.');
    }
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
