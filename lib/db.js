import dns from 'dns';
import mongoose from 'mongoose';

// Ensure MongoDB Atlas SRV lookups succeed across all local network DNS configurations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore in environments where setting DNS servers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB connection string.'
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
