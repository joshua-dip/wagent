import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { NextResponse } from "next/server";

interface AdminJwtPayload {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface RequireAdminOk {
  ok: true;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    source: "jwt" | "session";
  };
}
export interface RequireAdminFail {
  ok: false;
  response: NextResponse;
}
export type RequireAdminResult = RequireAdminOk | RequireAdminFail;

/**
 * Admin API용 서버측 가드.
 *
 * 1) wagent-auth JWT 쿠키를 우선 검증 (admin은 NextAuth가 아니라 JWT로 로그인하므로 필수)
 * 2) NextAuth 세션 + Admin DB로 폴백
 * 3) 둘 다 실패하면 401/403 NextResponse 반환 → 라우트에서 그대로 return
 *
 * 사용법:
 *   const gate = await requireAdmin()
 *   if (!gate.ok) return gate.response
 *   // gate.admin 사용 가능
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  // 1) JWT 쿠키 검증
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("wagent-auth")?.value;
    if (token) {
      const secret = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";
      const decoded = verify(token, secret) as AdminJwtPayload;
      if (decoded?.role === "admin" && decoded.email) {
        return {
          ok: true,
          admin: {
            id: decoded.id || "admin",
            email: decoded.email,
            name: decoded.name || "관리자",
            role: decoded.role,
            source: "jwt",
          },
        };
      }
    }
  } catch (e) {
    // 토큰 만료/위조: 다음 경로로 폴백
    console.warn("[requireAdmin] JWT 검증 실패, 세션 폴백:", (e as Error).message);
  }

  // 2) NextAuth 세션 + Admin DB 폴백
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectDB();
      const admin = await Admin.findOne({
        email: session.user.email.toLowerCase(),
        isActive: true,
      });
      if (admin) {
        return {
          ok: true,
          admin: {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            source: "session",
          },
        };
      }
      return {
        ok: false,
        response: NextResponse.json(
          { error: "관리자 권한이 필요합니다." },
          { status: 403 }
        ),
      };
    }
  } catch (e) {
    console.error("[requireAdmin] 세션 폴백 오류:", e);
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    ),
  };
}

// 관리자 권한 확인 함수 (구 시그니처 — 신규 코드는 requireAdmin 사용)
export async function checkAdminPermission(requiredRole: 'admin' | 'super_admin' = 'admin') {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { isAdmin: false, error: "인증이 필요합니다." };
    }

    await connectDB();

    // Admin 컬렉션에서 관리자 확인
    const admin = await Admin.findOne({ 
      email: session.user.email.toLowerCase(),
      isActive: true 
    });

    if (!admin) {
      return { isAdmin: false, error: "관리자 권한이 필요합니다." };
    }

    // 역할 권한 확인
    if (requiredRole === 'super_admin' && admin.role !== 'super_admin') {
      return { isAdmin: false, error: "슈퍼 관리자 권한이 필요합니다." };
    }

    return { 
      isAdmin: true, 
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };

  } catch (error) {
    console.error('관리자 권한 확인 오류:', error);
    return { isAdmin: false, error: "권한 확인 중 오류가 발생했습니다." };
  }
}

// 클라이언트 사이드 관리자 확인 (이메일 기반)
export function isAdminUser(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  
  // 임시로 이메일 기반 확인 (추후 role 기반으로 변경 가능)
  return userEmail.toLowerCase() === "wnsrb2898@naver.com";
}
