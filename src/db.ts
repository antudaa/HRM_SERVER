import mongoose from 'mongoose';
import config from './app/config';

declare global {
  var __mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

async function connectDB() {
  if (!config.database_url) throw new Error('DATABASE_URL is not set');

  if (!global.__mongoose) global.__mongoose = { conn: null, promise: null };
  if (global.__mongoose.conn) return global.__mongoose.conn;

  mongoose.set('bufferCommands', false);
  mongoose.set('strictQuery', false);

  if (!global.__mongoose.promise) {
    global.__mongoose.promise = mongoose.connect(config.database_url, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      family: 4,
    });
  }

  try {
    global.__mongoose.conn = await global.__mongoose.promise;

    const client = mongoose.connection.getClient();
    await client.db().admin().ping();

    return global.__mongoose.conn;
  } catch (e) {
    global.__mongoose.promise = null;
    global.__mongoose.conn = null;
    throw e;
  }
}

export default connectDB;

