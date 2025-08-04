import mongoose from 'mongoose'

// 환경변수 체크를 런타임으로 이동
const getMongoDbUri = (): string => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI가 설정되지 않았습니다')
    throw new Error('MONGODB_URI가 설정되지 않았습니다')
  }
  return uri
}

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
    console.log('기존 MongoDB 연결 재사용')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // AWS Amplify 환경에서 연결 풀 제한
      serverSelectionTimeoutMS: 5000, // 연결 시도 시간 제한
      socketTimeoutMS: 45000, // 소켓 타임아웃
      family: 4, // IPv4 사용
    }

    console.log('새로운 MongoDB 연결 시도...')
    const mongoUri = getMongoDbUri()
    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log('MongoDB 연결 성공!')
      return mongoose
    }).catch((error) => {
      console.error('MongoDB 연결 실패:', error)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    console.error('MongoDB 연결 캐시 오류:', e)
    cached.promise = null
    throw e
  }
}

export default connectDB