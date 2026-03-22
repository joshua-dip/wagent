import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createServerClient } from "@supabase/ssr";
import connectDB from "@/lib/db";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import {
  ensureMongoUserFromSupabase,
  issueWagentCookieOnResponse,
  resolveWagentRoleAndId,
} from "@/lib/supabase/mongo-sync";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

/** 미로그인도 200 + authenticated:false 로 응답 (브라우저 콘솔 401 노이즈 방지) */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("wagent-auth")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          email: string;
          name: string;
          role: string;
        };

        return NextResponse.json({
          authenticated: true as const,
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
          },
        });
      } catch {
        // JWT 만료/무효 → Supabase 세션으로 재발급 시도
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await connectDB();
          const mongoUser = await ensureMongoUserFromSupabase(user);
          const { id, role } = resolveWagentRoleAndId(mongoUser);
          const res = NextResponse.json({
            authenticated: true as const,
            user: {
              id,
              email: mongoUser.email,
              name: mongoUser.name,
              role,
            },
          });
          issueWagentCookieOnResponse(
            res,
            id,
            mongoUser.email,
            mongoUser.name,
            role
          );
          return res;
        }
      } catch (e) {
        console.error("check-session Supabase 연동:", e);
      }
    }

    return NextResponse.json({ authenticated: false as const });
  } catch (error) {
    console.error("세션 확인 오류:", error);
    return NextResponse.json({ authenticated: false as const });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const res = NextResponse.json({ message: "로그아웃 완료" });
    res.cookies.delete("wagent-auth", { path: "/" });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      });
      await supabase.auth.signOut();
    }

    return res;
  } catch (error) {
    console.error("로그아웃 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}