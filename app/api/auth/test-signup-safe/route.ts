import { NextRequest, NextResponse } from "next/server";

// 완전히 안전한 테스트 회원가입 API (DB 연결 없이)
export async function POST(request: NextRequest) {
  console.log('안전한 테스트 회원가입 API 시작');
  
  try {
    // 환경변수 상태 체크
    const envStatus = {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
      MONGODB_URI_LENGTH: process.env.MONGODB_URI?.length || 0,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
      STORAGE_TYPE: process.env.STORAGE_TYPE || 'NOT_SET'
    };
    
    console.log('환경변수 상태:', envStatus);
    
    const body = await request.json();
    const { email, password, name } = body;
    
    // 기본 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          error: "필수 필드가 누락되었습니다.",
          envStatus 
        },
        { status: 400 }
      );
    }
    
    // MongoDB 연결 시도 (선택적)
    let dbStatus = { connected: false, error: null as any };
    
    if (process.env.MONGODB_URI) {
      console.log('MongoDB 연결 시도...');
      try {
        // 동적 import로 에러 방지
        const { default: connectDB } = await import('@/lib/db');
        await connectDB();
        dbStatus.connected = true;
        console.log('MongoDB 연결 성공!');
        
        // User 모델 테스트
        try {
          const { default: User } = await import('@/models/User');
          const userCount = await User.countDocuments();
          console.log('User 모델 작동 확인, 총 사용자:', userCount);
          
          // 실제 사용자 생성 시도
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
          
          return NextResponse.json({
            success: true,
            message: "회원가입 성공!",
            user: {
              email: newUser.email,
              name: newUser.name
            },
            envStatus,
            dbStatus
          }, { status: 201 });
          
        } catch (userError) {
          console.error('User 모델 에러:', userError);
          dbStatus.error = userError instanceof Error ? userError.message : 'User model error';
        }
        
      } catch (dbError) {
        console.error('MongoDB 연결 실패:', dbError);
        dbStatus.connected = false;
        dbStatus.error = dbError instanceof Error ? dbError.message : 'DB connection error';
      }
    } else {
      dbStatus.error = 'MONGODB_URI not set';
    }
    
    // DB 연결 실패 시에도 응답 반환
    return NextResponse.json({
      success: false,
      message: "테스트 모드 - DB 연결 없이 응답",
      requestData: { email, name },
      envStatus,
      dbStatus,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('안전한 테스트 API 오류:', error);
    
    return NextResponse.json({
      error: "테스트 API 오류",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "안전한 테스트 회원가입 API",
    description: "환경변수와 DB 연결 없이도 작동하는 테스트 API",
    usage: "POST 요청으로 { email, password, name } 전송",
    environment: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'unknown'
    }
  });
}