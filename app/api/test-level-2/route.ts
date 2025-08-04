import { NextResponse } from "next/server";

// 레벨 2: 환경변수 테스트
export async function GET() {
  try {
    const envTest = {
      MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT_SET",
      MONGODB_URI_LENGTH: process.env.MONGODB_URI?.length || 0,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT_SET"
    };

    return NextResponse.json({
      level: 2,
      status: "success",
      message: "레벨 2 테스트 성공 - 환경변수 접근 가능",
      environment: envTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      level: 2,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}