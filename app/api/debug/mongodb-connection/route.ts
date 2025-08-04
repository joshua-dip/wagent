import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  console.log('🔍 MongoDB 연결 진단 API 시작');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
    mongoUriLength: process.env.MONGODB_URI?.length || 0,
    connectionState: 'unknown',
    connectionStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    },
    error: null as any,
    details: {} as any
  };

  try {
    // 현재 연결 상태 확인
    diagnostics.connectionState = mongoose.connection.readyState;
    diagnostics.details.currentState = diagnostics.connectionStates[mongoose.connection.readyState as keyof typeof diagnostics.connectionStates];
    
    console.log('현재 MongoDB 연결 상태:', diagnostics.details.currentState);

    // MongoDB URI 형식 검증
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다');
    }

    if (!process.env.MONGODB_URI.startsWith('mongodb')) {
      throw new Error('MONGODB_URI 형식이 올바르지 않습니다');
    }

    // 연결 시도
    console.log('MongoDB 연결 시도...');
    const startTime = Date.now();
    
    await connectDB();
    
    const endTime = Date.now();
    diagnostics.details.connectionTime = endTime - startTime;

    // 연결 후 상태 재확인
    diagnostics.connectionState = mongoose.connection.readyState;
    diagnostics.details.finalState = diagnostics.connectionStates[mongoose.connection.readyState as keyof typeof diagnostics.connectionStates];

    // 데이터베이스 정보 수집
    const dbInfo = {
      name: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: [] as string[]
    };

    try {
      // 컬렉션 목록 가져오기
      const collections = await mongoose.connection.db?.listCollections().toArray();
      dbInfo.collections = collections?.map(c => c.name) || [];
    } catch (collectionError) {
      console.log('컬렉션 목록 조회 오류:', collectionError);
      dbInfo.collections = ['컬렉션 목록 조회 실패'];
    }

    diagnostics.details.database = dbInfo;

    console.log('MongoDB 연결 진단 완료:', diagnostics.details);

    return NextResponse.json({
      success: true,
      message: 'MongoDB 연결 성공',
      diagnostics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('MongoDB 연결 진단 오류:', error);
    
    diagnostics.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    };

    // 연결 실패 후에도 현재 상태 확인
    diagnostics.connectionState = mongoose.connection.readyState;
    diagnostics.details.errorState = diagnostics.connectionStates[mongoose.connection.readyState as keyof typeof diagnostics.connectionStates];

    return NextResponse.json({
      success: false,
      message: `MongoDB 연결 실패: ${error.message}`,
      diagnostics,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "이 엔드포인트는 GET 요청만 지원합니다",
    usage: "GET /api/debug/mongodb-connection"
  }, { status: 405 });
}