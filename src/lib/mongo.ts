import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoGlobal: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

if (!global._mongoGlobal) {
  // @ts-ignore
  global._mongoGlobal = { conn: null, promise: null };
}

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (global._mongoGlobal!.conn) return global._mongoGlobal!.conn;
  if (!global._mongoGlobal!.promise) {
    global._mongoGlobal!.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  global._mongoGlobal!.conn = await global._mongoGlobal!.promise;
  return global._mongoGlobal!.conn;
}

export function isMongoEnabled() {
  return !!MONGODB_URI;
}
