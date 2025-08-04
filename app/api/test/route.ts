import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      message: "기본 API 작동 중",
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'unknown'
      }
    });
  } catch (error) {
    console.error('기본 테스트 API 오류:', error);
    return NextResponse.json({
      status: "error", 
      message: "기본 API 오류",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}