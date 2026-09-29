const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentpulse';

  try {
    // Attempt standard connection to MongoDB URI
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[DATABASE SUCCESS] Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[DATABASE WARNING] Could not connect to local MongoDB (${err.message}). Starting in-memory MongoDB server...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[DATABASE SUCCESS] Connected to In-Memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error(`[DATABASE CRITICAL] Failed to start MongoMemoryServer: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
