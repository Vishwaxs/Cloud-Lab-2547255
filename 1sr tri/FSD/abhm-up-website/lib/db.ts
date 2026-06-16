import mongoose from "mongoose";
import { getEnv } from "./env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis.__mongooseCache || { conn: null, promise: null };
globalThis.__mongooseCache = globalCache;

export async function connectDb(): Promise<typeof mongoose> {
  if (globalCache.conn) return globalCache.conn;

  const { MONGODB_URI } = getEnv();
  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
