import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI가 설정되지 않았습니다')
}

const MONGODB_URI: string = process.env.MONGODB_URI

interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global로 mongoose 연결을 캐시합니다 (Next.js development에서 hot reload 시 재연결 방지)
let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB