import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("wagent-auth")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('세션 확인 오류:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("wagent-auth");
    
    return NextResponse.json({ message: "로그아웃 완료" });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json({ error: "로그아웃 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}