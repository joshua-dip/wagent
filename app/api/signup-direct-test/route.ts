import { NextResponse } from "next/server";

// 직접 회원가입 테스트 (환경변수 설정 후)
export async function POST(request: Request) {
  const result = {
    status: "testing",
    message: "",
    environment: {
      mongoUri: process.env.MONGODB_URI ? "SET" : "NOT_SET",
      mongoUriLength: process.env.MONGODB_URI?.length || 0
    },
    steps: {
      import: false,
      connection: false,
      validation: false,
      creation: false
    },
    user: null as any,
    error: null as any,
    timestamp: new Date().toISOString()
  };

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      throw new Error("이메일, 비밀번호, 이름은 필수 입력 항목입니다");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI 환경변수가 설정되지 않았습니다. Amplify Console에서 환경변수를 설정해주세요.");
    }

    // 1. 모듈 import
    console.log("직접 회원가입: 모듈 import...");
    const connectDB = (await import("@/lib/db")).default;
    const User = (await import("@/models/User")).default;
    result.steps.import = true;

    // 2. MongoDB 연결
    console.log("직접 회원가입: MongoDB 연결...");
    await connectDB();
    result.steps.connection = true;

    // 3. 이메일 중복 체크
    console.log("직접 회원가입: 이메일 중복 체크...");
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("이미 사용 중인 이메일입니다");
    }
    result.steps.validation = true;

    // 4. 사용자 생성
    console.log("직접 회원가입: 사용자 생성...");
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
    result.steps.creation = true;

    result.user = {
      email: newUser.email,
      name: newUser.name,
      created: newUser.createdAt
    };

    result.status = "success";
    result.message = "직접 회원가입 테스트 성공!";

    console.log("✅ 직접 회원가입 성공:", newUser.email);

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ 직접 회원가입 실패:", error);
    
    result.status = "error";
    result.message = error instanceof Error ? error.message : "Unknown error";
    result.error = {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null
    };

    return NextResponse.json(result, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "직접 회원가입 테스트 API",
    usage: "POST 요청으로 { email, password, name } 전송",
    environment: {
      mongoUri: process.env.MONGODB_URI ? "SET" : "NOT_SET",
      mongoUriLength: process.env.MONGODB_URI?.length || 0
    }
  });
}