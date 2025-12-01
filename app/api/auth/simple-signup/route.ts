import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('간단한 회원가입 API 시작 - 환경:', process.env.NODE_ENV);
  
  try {
    // 환경변수 체크 로깅
    console.log('환경변수 상태:', {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV
    });
    
    const body = await request.json();
    const { email, password, name } = body;

    console.log('입력 데이터:', { email, name, passwordLength: password?.length });

    // 기본 필수 필드 검사 (간단한 validation)
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // 이메일 형식 간단 검사
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: "올바른 이메일 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검사 (간단함)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // MongoDB 연결
    console.log('MongoDB 연결 시도...');
    try {
      await connectDB();
      console.log('MongoDB 연결 성공');
    } catch (dbError) {
      console.error('MongoDB 연결 실패:', dbError);
      return NextResponse.json(
        { 
          error: "데이터베이스 연결에 실패했습니다.",
          details: dbError instanceof Error ? dbError.message : "Unknown DB error",
          env: process.env.NODE_ENV
        },
        { status: 503 }
      );
    }

    // 이메일 중복 체크
    console.log('이메일 중복 체크:', email.toLowerCase());
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('이메일 중복:', email);
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 새 사용자 생성
    console.log('새 사용자 생성 중...');
    const newUser = new User({
      email: email.toLowerCase(),
      password: password, // User 모델에서 자동 해시화
      name: name,
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
      isActive: true
    });

    await newUser.save();
    console.log('사용자 저장 완료:', newUser.email);

    // 6자리 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후

    // 기존 인증번호 삭제 (같은 이메일)
    await EmailVerificationToken.deleteMany({ email: newUser.email });

    // 새 인증번호 저장
    await EmailVerificationToken.create({
      email: newUser.email,
      code: verificationCode,
      expiresAt,
      attempts: 0,
    });

    // TODO: 실제 이메일 발송 (Nodemailer, SendGrid 등)
    console.log('📧 이메일 인증번호:', verificationCode);
    console.log('✅ 회원가입 완료 - 이메일 인증 필요');

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다! 이메일로 발송된 인증번호를 입력해주세요.",
      user: {
        email: newUser.email,
        name: newUser.name,
        created: true
      },
      // 개발 환경에서만 인증번호 노출
      ...(process.env.NODE_ENV === 'development' && {
        verificationCode
      })
    }, { status: 201 });

  } catch (error) {
    console.error('간단한 회원가입 오류:', error);
    
    // MongoDB 중복 키 오류
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "회원가입 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "간단한 회원가입 API",
    usage: "POST 요청으로 { email, password, name } 전송",
    requirements: {
      email: "이메일 형식 (@ 포함)",
      password: "6자 이상",
      name: "이름 (필수)"
    }
  });
}