import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    await connectDB();

    // 테스트 사용자 이메일
    const testEmail = "test@wagent.com";
    
    // 기존 테스트 사용자 확인
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "테스트 사용자가 이미 존재합니다",
        user: {
          email: existingUser.email,
          name: existingUser.name,
          created: false
        },
        loginInfo: {
          email: testEmail,
          password: "test123"
        }
      });
    }

    // 새 테스트 사용자 생성
    const testUser = new User({
      email: testEmail,
      password: "test123", // 해시화는 User 모델에서 자동 처리
      name: "테스트 사용자",
      nickname: "테스터",
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
      isActive: true
    });

    await testUser.save();

    return NextResponse.json({
      success: true,
      message: "테스트 사용자가 생성되었습니다",
      user: {
        email: testUser.email,
        name: testUser.name,
        created: true
      },
      loginInfo: {
        email: testEmail,
        password: "test123"
      }
    });

  } catch (error) {
    console.error('테스트 사용자 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "테스트 사용자 생성 중 오류가 발생했습니다."
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "테스트 사용자 생성 API",
    usage: "POST 요청으로 테스트 사용자를 생성합니다",
    testAccount: {
      email: "test@wagent.com",
      password: "test123",
      name: "테스트 사용자"
    }
  });
}