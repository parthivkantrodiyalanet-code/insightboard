import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * MongoDB Connection Cache Interface
 * Maintains a cached connection across hot reloads in development
 * This prevents connections from growing exponentially during API Route usage
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes and maintains a connection to MongoDB
 * Uses connection caching to prevent multiple connections in serverless environments
 * 
 * @returns {Promise<typeof mongoose>} The mongoose instance
 * @throws {Error} If connection fails
 */
async function connectToDatabase() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for better error handling
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on failure to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;

