import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Try normal connection first if we think it's a real cluster
    if (!uri.includes('localhost') && !uri.includes('127.0.0.1')) {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    // Try connecting to local mongodb, if it fails, fallback to memory server
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected to local instance: ${conn.connection.host}`);
    } catch (localError) {
      console.log('Local MongoDB not running. Starting in-memory MongoDB for testing...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
