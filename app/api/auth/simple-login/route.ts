import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('간단한 로그인 시도:', email);

    // 관리자 계정 확인
    if (email === "wnsbr2898@naver.com" && password === "123456") {
      console.log('관리자 인증 성공');
      
      // JWT 토큰 생성
      const token = jwt.sign(
        {
          id: "admin",
          email: "wnsbr2898@naver.com",
          name: "관리자",
          role: "admin"
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 쿠키 설정
      const cookieStore = cookies();
      cookieStore.set("wagent-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: "로그인 성공",
        user: {
          email: "wnsbr2898@naver.com",
          name: "관리자",
          role: "admin"
        }
      });
    }

    console.log('인증 실패:', email);
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );

  } catch (error) {
    console.error('간단한 로그인 오류:', error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}