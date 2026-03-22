import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  ensureMongoUserFromSupabase,
  issueWagentCookieOnResponse,
  resolveWagentRoleAndId,
} from "@/lib/supabase/mongo-sync";

/** Supabase 세션이 있을 때 Mongo 사용자 동기화 후 wagent-auth 쿠키 발급 */
export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase가 설정되지 않았습니다." },
        { status: 501 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Supabase 세션이 없습니다." },
        { status: 401 }
      );
    }

    await connectDB();
    const mongoUser = await ensureMongoUserFromSupabase(user);
    const { id, role } = resolveWagentRoleAndId(mongoUser);

    const res = NextResponse.json({
      ok: true,
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
  } catch (e) {
    console.error("supabase-bridge:", e);
    return NextResponse.json(
      { error: "세션 연동에 실패했습니다." },
      { status: 500 }
    );
  }
}
