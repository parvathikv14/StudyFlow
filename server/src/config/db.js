import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is missing. Copy server/.env.example to server/.env and set your MongoDB connection string.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
