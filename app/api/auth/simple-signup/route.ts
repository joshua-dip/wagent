import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import { sendVerificationCodeEmail } from "@/lib/email";

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

    // 이메일 중복 처리: 인증 완료·카카오 가입만 '사용 중', 미인증 이메일 가입은 재전송
    console.log('이메일 중복 체크:', email.toLowerCase());
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    let userDoc: InstanceType<typeof User>;
    let isBrandNewUser = true;

    if (existingUser) {
      if (existingUser.kakaoId) {
        return NextResponse.json(
          {
            error:
              '이 이메일은 카카오로 이미 가입되어 있습니다. 카카오 로그인을 이용해 주세요.',
          },
          { status: 409 }
        );
      }
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 409 }
        );
      }
      // 이메일 인증 전 이탈 → 같은 이메일로 다시 가입 시 정보 갱신 + 인증번호 재발송
      console.log('미인증 계정 재가입(재전송):', email);
      isBrandNewUser = false;
      existingUser.name = name;
      existingUser.password = password;
      existingUser.termsAgreed = true;
      existingUser.privacyAgreed = true;
      await existingUser.save();
      userDoc = existingUser;
    } else {
      console.log('새 사용자 생성 중...');
      const newUser = new User({
        email: email.toLowerCase(),
        password: password,
        name: name,
        termsAgreed: true,
        privacyAgreed: true,
        marketingAgreed: false,
        isActive: true,
      });
      await newUser.save();
      console.log('사용자 저장 완료:', newUser.email);
      userDoc = newUser;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerificationToken.deleteMany({ email: userDoc.email });

    await EmailVerificationToken.create({
      email: userDoc.email,
      code: verificationCode,
      expiresAt,
      attempts: 0,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const mailResult = await sendVerificationCodeEmail(
      userDoc.email,
      userDoc.name,
      verificationCode
    );

    if (!mailResult.ok) {
      console.error('📧 이메일 발송 실패:', mailResult.error);
      if (isProd) {
        await EmailVerificationToken.deleteMany({ email: userDoc.email });
        if (isBrandNewUser) {
          await User.findByIdAndDelete(userDoc._id);
        }
        return NextResponse.json(
          {
            error:
              '인증 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.',
            details: mailResult.error,
          },
          { status: 503 }
        );
      }
      console.log('📧 (개발) 인증번호 콘솔:', verificationCode);
    } else {
      console.log('📧 이메일 인증번호 발송 완료:', userDoc.email);
    }

    const successMessage = isBrandNewUser
      ? mailResult.ok
        ? '회원가입이 완료되었습니다! 이메일로 발송된 인증번호를 입력해 주세요.'
        : '회원가입이 완료되었습니다. (개발: 메일 미설정) 아래 인증번호를 입력해 주세요.'
      : mailResult.ok
        ? '이전에 인증을 완료하지 않은 계정입니다. 인증번호를 다시 보냈습니다. 메일함을 확인해 주세요.'
        : '(개발) 인증번호를 다시 생성했습니다. 아래 번호를 입력해 주세요.';

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        resumedSignup: !isBrandNewUser,
        user: {
          email: userDoc.email,
          name: userDoc.name,
          created: isBrandNewUser,
        },
        emailSent: mailResult.ok,
        ...(process.env.NODE_ENV === 'development' && {
          verificationCode,
        }),
      },
      { status: 201 }
    );

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