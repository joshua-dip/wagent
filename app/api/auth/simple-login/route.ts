import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Admin from "@/models/Admin";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    // env 미설정 시 거부 — 평문 fallback 제거 (보안)
    console.error("[simple-login] ADMIN_EMAIL / ADMIN_PASSWORD_HASH env 미설정");
    return false;
  }
  if (email.toLowerCase().trim() !== ADMIN_EMAIL) return false;
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (e) {
    console.error("[simple-login] bcrypt 비교 오류:", e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('로그인 시도:', email);

    // 1. 관리자 계정 우선 확인 (env 기반 bcrypt 검증)
    const isAdminEmailInput = ADMIN_EMAIL && email.toLowerCase().trim() === ADMIN_EMAIL;
    if (await verifyAdminCredentials(email, password)) {
      console.log('관리자 인증 성공');

      const token = jwt.sign(
        {
          id: "admin",
          email: ADMIN_EMAIL,
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
          email: ADMIN_EMAIL,
          name: "관리자",
          role: "admin"
        }
      });
    }

    // admin 이메일로 들어왔는데 비번 불일치 → 일반 user 폴백 차단 (admin 우회 방지)
    if (isAdminEmailInput) {
      console.log('관리자 비밀번호 불일치, 일반 사용자 폴백 차단');
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
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
        
        // 이메일 인증 확인 (운영 환경에서만)
        if (process.env.NODE_ENV === 'production' && !user.emailVerified && user.signupMethod === 'email') {
          return NextResponse.json(
            { 
              error: "이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요.",
              emailNotVerified: true
            },
            { status: 403 }
          );
        }
        
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