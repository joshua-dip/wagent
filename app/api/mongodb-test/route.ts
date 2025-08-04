import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('MongoDB 연결 테스트 시작...');
    
    // MongoDB 연결 시도
    await connectDB();
    
    const endTime = Date.now();
    const connectionTime = endTime - startTime;
    
    console.log(`MongoDB 연결 성공! (${connectionTime}ms)`);
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB 연결 성공',
      connectionTime: `${connectionTime}ms`,
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      networkInfo: {
        note: 'AWS Amplify에서 MongoDB Atlas 접근 성공'
      }
    });

  } catch (error) {
    const endTime = Date.now();
    const connectionTime = endTime - startTime;
    
    console.error('MongoDB 연결 실패:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB 연결 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionTime: `${connectionTime}ms`,
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      troubleshooting: {
        step1: 'MongoDB Atlas → Security → Network Access',
        step2: 'ADD IP ADDRESS → 0.0.0.0/0 (Allow access from anywhere)',
        step3: 'Environment Variables에 MONGODB_URI 확인',
        awsAmplifyIp: 'Dynamic IPs - use 0.0.0.0/0 for development'
      }
    }, { status: 500 });
  }
}