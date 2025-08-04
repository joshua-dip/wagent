import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  console.log('🔍 MongoDB 빠른 테스트 API 시작');

  const result = {
    timestamp: new Date().toISOString(),
    tests: {
      connection: { status: 'pending', message: '', duration: 0 },
      userRead: { status: 'pending', message: '', duration: 0 },
      userWrite: { status: 'pending', message: '', duration: 0 }
    },
    summary: {
      success: 0,
      failed: 0,
      total: 3
    }
  };

  // 1. MongoDB 연결 테스트
  try {
    const startTime = Date.now();
    await connectDB();
    result.tests.connection = {
      status: 'success',
      message: 'MongoDB 연결 성공',
      duration: Date.now() - startTime
    };
    result.summary.success++;
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    result.tests.connection = {
      status: 'error',
      message: `MongoDB 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: 0
    };
    result.summary.failed++;
    console.error('❌ MongoDB 연결 실패:', error);
  }

  // 2. User 모델 읽기 테스트
  if (result.tests.connection.status === 'success') {
    try {
      const startTime = Date.now();
      const userCount = await User.countDocuments();
      const adminUser = await User.findOne({ email: 'wnsbr2898@naver.com' });
      
      result.tests.userRead = {
        status: 'success',
        message: `User 읽기 성공 (총 ${userCount}명, 관리자: ${adminUser ? '존재' : '없음'})`,
        duration: Date.now() - startTime
      };
      result.summary.success++;
      console.log('✅ User 모델 읽기 성공');
    } catch (error) {
      result.tests.userRead = {
        status: 'error',
        message: `User 읽기 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0
      };
      result.summary.failed++;
      console.error('❌ User 모델 읽기 실패:', error);
    }

    // 3. User 모델 쓰기 테스트 (생성 후 즉시 삭제)
    try {
      const startTime = Date.now();
      const testEmail = `test-${Date.now()}@quick-test.com`;
      
      // 생성
      const testUser = new User({
        email: testEmail,
        password: '123456',
        name: 'Quick Test User',
        termsAgreed: true,
        privacyAgreed: true,
        isActive: true
      });
      
      await testUser.save();
      
      // 즉시 삭제
      await User.findByIdAndDelete(testUser._id);
      
      result.tests.userWrite = {
        status: 'success',
        message: `User 쓰기 성공 (생성 및 삭제 완료)`,
        duration: Date.now() - startTime
      };
      result.summary.success++;
      console.log('✅ User 모델 쓰기 성공');
    } catch (error) {
      result.tests.userWrite = {
        status: 'error',
        message: `User 쓰기 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0
      };
      result.summary.failed++;
      console.error('❌ User 모델 쓰기 실패:', error);
    }
  } else {
    result.tests.userRead.status = 'skipped';
    result.tests.userRead.message = 'MongoDB 연결 실패로 인해 건너뜀';
    result.tests.userWrite.status = 'skipped';
    result.tests.userWrite.message = 'MongoDB 연결 실패로 인해 건너뜀';
    result.summary.failed += 2;
  }

  const isSuccess = result.summary.success === result.summary.total;
  console.log(`📊 MongoDB 빠른 테스트 완료: ${result.summary.success}/${result.summary.total} 성공`);

  return NextResponse.json({
    success: isSuccess,
    message: isSuccess ? 'MongoDB 모든 테스트 성공!' : `MongoDB 테스트 실패: ${result.summary.failed}개 실패`,
    ...result
  }, {
    status: isSuccess ? 200 : 500
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 MongoDB 빠른 회원가입 테스트:', email);

    await connectDB();
    
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 사용자 생성
    const newUser = new User({
      email: email.toLowerCase(),
      password: password,
      name: name,
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
      isActive: true
    });

    await newUser.save();
    console.log('✅ 빠른 회원가입 성공:', newUser.email);

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다!',
      user: {
        email: newUser.email,
        name: newUser.name,
        created: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('❌ 빠른 회원가입 실패:', error);
    return NextResponse.json(
      { 
        error: '회원가입 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}