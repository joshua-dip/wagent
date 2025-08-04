import { NextResponse } from "next/server";

// 레벨 4: MongoDB 연결만 테스트
let connectDB: any;
let mongoose: any;

try {
  connectDB = require("@/lib/db").default;
  mongoose = require("mongoose");
} catch (importError) {
  console.error("Import 오류:", importError);
}

export async function GET() {
  const result = {
    level: 4,
    status: "testing",
    message: "",
    connection: {
      beforeState: "unknown",
      afterState: "unknown",
      error: null as any
    },
    timestamp: new Date().toISOString()
  };

  try {
    if (!connectDB) {
      throw new Error("connectDB 함수를 import할 수 없습니다");
    }

    if (!mongoose) {
      throw new Error("mongoose를 import할 수 없습니다");
    }

    // 연결 전 상태
    result.connection.beforeState = mongoose.connection.readyState;

    console.log("레벨 4: MongoDB 연결 시도...");
    await connectDB();
    
    // 연결 후 상태
    result.connection.afterState = mongoose.connection.readyState;

    result.status = "success";
    result.message = "레벨 4 테스트 성공 - MongoDB 연결 가능";

    return NextResponse.json(result);

  } catch (error) {
    console.error("레벨 4 MongoDB 연결 오류:", error);
    
    result.status = "error";
    result.message = "레벨 4 테스트 실패 - MongoDB 연결 불가";
    result.connection.error = error instanceof Error ? error.message : "Unknown error";
    result.connection.afterState = mongoose?.connection?.readyState || "unknown";

    return NextResponse.json(result, { status: 500 });
  }
}