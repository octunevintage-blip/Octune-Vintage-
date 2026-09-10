import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Check if uri is missing or empty
    if (!uri) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No MONGODB_URI provided. Starting in-memory MongoDB for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        return;
      } else {
        console.error('CRITICAL: MONGODB_URI environment variable is missing on Render!');
        process.exit(1);
      }
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
