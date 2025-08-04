import { NextResponse } from "next/server";

// 레벨 3: MongoDB import만 테스트 (연결 시도 없음)
let connectDB: any;
let User: any;
let mongoose: any;

try {
  connectDB = require("@/lib/db").default;
  User = require("@/models/User").default;
  mongoose = require("mongoose");
} catch (importError) {
  console.error("Import 오류:", importError);
}

export async function GET() {
  try {
    const importTest = {
      connectDB: !!connectDB,
      User: !!User,
      mongoose: !!mongoose,
      mongooseVersion: mongoose?.version || "unknown"
    };

    return NextResponse.json({
      level: 3,
      status: "success",
      message: "레벨 3 테스트 성공 - MongoDB 모듈 import 가능",
      imports: importTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      level: 3,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      imports: {
        connectDB: !!connectDB,
        User: !!User,
        mongoose: !!mongoose
      }
    }, { status: 500 });
  }
}