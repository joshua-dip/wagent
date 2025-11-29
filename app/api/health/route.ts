import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    // 환경변수 확인
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      TOSS_CLIENT_KEY: !!process.env.TOSS_CLIENT_KEY,
      TOSS_SECRET_KEY: !!process.env.TOSS_SECRET_KEY,
      NEXT_PUBLIC_TOSS_CLIENT_KEY: !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      TOSS_MID: process.env.TOSS_MID,
      // 디버깅: 실제 값 일부 표시 (처음 10자)
      TOSS_CLIENT_KEY_PREFIX: process.env.TOSS_CLIENT_KEY?.substring(0, 10) || 'not set',
      TOSS_SECRET_KEY_PREFIX: process.env.TOSS_SECRET_KEY?.substring(0, 10) || 'not set',
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      STORAGE_TYPE: process.env.STORAGE_TYPE,
      NODE_ENV: process.env.NODE_ENV,
    };

    // MongoDB 연결 테스트
    let mongoStatus = 'disconnected';
    let mongoError = null;
    
    try {
      await connectDB();
      mongoStatus = 'connected';
    } catch (error) {
      mongoError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      mongodb: {
        status: mongoStatus,
        error: mongoError
      },
      amplify: {
        region: process.env.AWS_REGION || 'unknown',
        runtime: 'nodejs18.x'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}