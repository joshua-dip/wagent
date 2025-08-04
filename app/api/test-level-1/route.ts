import { NextResponse } from "next/server";

// 레벨 1: 가장 기본적인 API (import 최소화)
export async function GET() {
  try {
    return NextResponse.json({
      level: 1,
      status: "success",
      message: "레벨 1 테스트 성공 - 기본 Next.js API 작동",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      level: 1,
      status: "error", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}