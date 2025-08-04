import { NextResponse } from "next/server";

// 레벨 5: User 모델 테스트
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
  const result = {
    level: 5,
    status: "testing",
    message: "",
    connection: { state: "unknown" },
    userModel: { accessible: false, userCount: 0, error: null as any },
    timestamp: new Date().toISOString()
  };

  try {
    if (!connectDB || !User || !mongoose) {
      throw new Error("필수 모듈들을 import할 수 없습니다");
    }

    console.log("레벨 5: MongoDB 연결 시도...");
    await connectDB();
    result.connection.state = mongoose.connection.readyState;

    console.log("레벨 5: User 모델 접근 시도...");
    const userCount = await User.countDocuments();
    result.userModel.accessible = true;
    result.userModel.userCount = userCount;

    result.status = "success";
    result.message = `레벨 5 테스트 성공 - User 모델 접근 가능 (${userCount}명)`;

    return NextResponse.json(result);

  } catch (error) {
    console.error("레벨 5 User 모델 오류:", error);
    
    result.status = "error";
    result.message = "레벨 5 테스트 실패 - User 모델 접근 불가";
    result.userModel.error = error instanceof Error ? error.message : "Unknown error";
    result.connection.state = mongoose?.connection?.readyState || "unknown";

    return NextResponse.json(result, { status: 500 });
  }
}