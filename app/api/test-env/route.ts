import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 민감한 정보는 마스킹하여 표시
    const envCheck = {
      // 필수 환경변수들
      MONGODB_URI: process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      
      // AWS 설정
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET (length: ' + process.env.AWS_ACCESS_KEY_ID.length + ')' : 'NOT SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'NOT SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT SET',
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || 'NOT SET',
      
      // 기타
      STORAGE_TYPE: process.env.STORAGE_TYPE || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      
      // 전체 환경변수 개수 (디버깅용)
      totalEnvVars: Object.keys(process.env).length
    };

    return NextResponse.json({
      status: "success",
      message: "환경변수 확인 완료",
      timestamp: new Date().toISOString(),
      environment: envCheck
    });

  } catch (error) {
    console.error('환경변수 확인 오류:', error);
    return NextResponse.json({
      status: "error",
      message: "환경변수 확인 중 오류 발생",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}