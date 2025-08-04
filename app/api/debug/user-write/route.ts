import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  console.log('🔍 User 모델 쓰기 진단 API 시작');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    dbConnection: false,
    userCreated: false,
    userDeleted: false,
    testUser: null as any,
    error: null as any
  };

  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      throw new Error('email과 name은 필수 입력 항목입니다');
    }

    // 1. MongoDB 연결
    console.log('MongoDB 연결 중...');
    await connectDB();
    diagnostics.dbConnection = true;
    console.log('MongoDB 연결 성공');

    // 2. 테스트 사용자 생성
    console.log('테스트 사용자 생성 중...');
    const testUser = new User({
      email: email,
      password: '123456', // 테스트용 간단한 비밀번호
      name: name,
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
      isActive: true
    });

    await testUser.save();
    diagnostics.userCreated = true;
    diagnostics.testUser = {
      id: testUser._id,
      email: testUser.email,
      name: testUser.name,
      created: testUser.createdAt
    };
    console.log('테스트 사용자 생성 완료:', testUser.email);

    // 3. 생성된 사용자 조회 테스트
    const foundUser = await User.findById(testUser._id);
    if (!foundUser) {
      throw new Error('생성된 사용자를 다시 조회할 수 없습니다');
    }
    console.log('생성된 사용자 조회 성공');

    // 4. 테스트 사용자 삭제 (정리)
    await User.findByIdAndDelete(testUser._id);
    diagnostics.userDeleted = true;
    console.log('테스트 사용자 삭제 완료 (정리)');

    console.log('User 모델 쓰기 진단 완료');

    return NextResponse.json({
      success: true,
      message: 'User 모델 쓰기 테스트 성공 (생성 및 삭제 완료)',
      diagnostics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('User 모델 쓰기 진단 오류:', error);
    
    diagnostics.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    };

    // 실패 시에도 정리 시도
    if (diagnostics.testUser && diagnostics.testUser.id) {
      try {
        await User.findByIdAndDelete(diagnostics.testUser.id);
        diagnostics.userDeleted = true;
        console.log('오류 발생 후 테스트 사용자 정리 완료');
      } catch (cleanupError) {
        console.error('테스트 사용자 정리 실패:', cleanupError);
      }
    }

    return NextResponse.json({
      success: false,
      message: `User 모델 쓰기 실패: ${error.message}`,
      diagnostics,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "이 엔드포인트는 POST 요청만 지원합니다",
    usage: "POST /api/debug/user-write",
    body: {
      email: "test@example.com",
      name: "Test User"
    }
  });
}