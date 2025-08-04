import { NextResponse } from "next/server";

// 레벨 6: 안전한 MongoDB import 및 연결 테스트
export async function GET() {
  const result = {
    level: 6,
    status: "testing",
    message: "",
    environment: {
      mongoUri: process.env.MONGODB_URI ? "SET" : "NOT_SET",
      mongoUriLength: process.env.MONGODB_URI?.length || 0
    },
    imports: {
      connectDB: false,
      User: false,
      mongoose: false
    },
    connection: {
      beforeState: "unknown",
      afterState: "unknown",
      error: null as any
    },
    userTest: {
      accessible: false,
      userCount: 0,
      error: null as any
    },
    timestamp: new Date().toISOString()
  };

  try {
    // 환경변수 먼저 확인
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI 환경변수가 설정되지 않았습니다");
    }

    // 1. 안전한 모듈 import
    console.log("레벨 6: 모듈 import 시도...");
    
    const connectDB = (await import("@/lib/db")).default;
    result.imports.connectDB = !!connectDB;
    
    const User = (await import("@/models/User")).default;
    result.imports.User = !!User;
    
    const mongoose = await import("mongoose");
    result.imports.mongoose = !!mongoose;

    console.log("레벨 6: 모듈 import 성공");

    // 2. MongoDB 연결 테스트
    console.log("레벨 6: MongoDB 연결 시도...");
    result.connection.beforeState = mongoose.connection.readyState;
    
    await connectDB();
    
    result.connection.afterState = mongoose.connection.readyState;
    console.log("레벨 6: MongoDB 연결 성공");

    // 3. User 모델 테스트
    console.log("레벨 6: User 모델 테스트...");
    const userCount = await User.countDocuments();
    result.userTest.accessible = true;
    result.userTest.userCount = userCount;
    
    const adminUser = await User.findOne({ email: 'wnsbr2898@naver.com' });
    result.userTest.adminExists = !!adminUser;
    
    console.log("레벨 6: User 모델 테스트 성공");

    result.status = "success";
    result.message = `레벨 6 테스트 성공 - 모든 MongoDB 기능 정상 (사용자 ${userCount}명)`;

    return NextResponse.json(result);

  } catch (error) {
    console.error("레벨 6 오류:", error);
    
    result.status = "error";
    result.message = `레벨 6 테스트 실패: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    if (error.message?.includes('MONGODB_URI')) {
      result.connection.error = "환경변수 MONGODB_URI가 설정되지 않음";
    } else if (error.message?.includes('import')) {
      result.connection.error = "MongoDB 모듈 import 실패";
    } else if (error.message?.includes('connect')) {
      result.connection.error = "MongoDB 연결 실패";
    } else {
      result.connection.error = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json(result, { status: 500 });
  }
}