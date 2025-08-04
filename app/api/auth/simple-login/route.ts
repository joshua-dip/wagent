import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('로그인 시도:', email);

    // 1. 관리자 계정 우선 확인 (빠른 처리)
    if (email === "wnsbr2898@naver.com" && password === "123456") {
      console.log('관리자 인증 성공');
      
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

      const cookieStore = await cookies();
      cookieStore.set("wagent-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: "관리자 로그인 성공",
        user: {
          email: "wnsbr2898@naver.com",
          name: "관리자",
          role: "admin"
        }
      });
    }

    // 2. MongoDB에서 일반 사용자 확인
    try {
      await connectDB();
      console.log('MongoDB 연결 성공 - 사용자 확인 중');

      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (user && await user.comparePassword(password)) {
        console.log('일반 사용자 인증 성공:', user.email);
        
        const token = jwt.sign(
          {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: "user"
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        const cookieStore = await cookies();
        cookieStore.set("wagent-auth", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/"
        });

        return NextResponse.json({
          success: true,
          message: "로그인 성공",
          user: {
            email: user.email,
            name: user.name,
            role: "user"
          }
        });
      }

      console.log('사용자 인증 실패:', email);
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );

    } catch (dbError) {
      console.error('DB 연결 또는 사용자 조회 오류:', dbError);
      return NextResponse.json(
        { error: "로그인 처리 중 데이터베이스 오류가 발생했습니다." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('로그인 시스템 오류:', error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}