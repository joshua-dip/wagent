import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { claimAttendance } from "@/lib/pric";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const u = session.user as { id?: string };
    if (u.id) return String(u.id);
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("wagent-auth")?.value;
  if (token) {
    try {
      const d = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as { id?: string; _id?: string };
      const id = d.id || d._id;
      if (id) return String(id);
    } catch {
      return null;
    }
  }
  return null;
}

/** 매일 출석 보상 — 1일 1회, 1000~5000 프릭 랜덤. */
export async function POST(_request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const result = await claimAttendance(userId);
    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          alreadyChecked: result.alreadyChecked,
          message: result.alreadyChecked ? "오늘은 이미 출석했어요. 내일 다시 받아주세요!" : "출석 처리에 실패했습니다.",
          balance: result.balanceAfter,
        },
        { status: result.alreadyChecked ? 409 : 400 },
      );
    }
    return NextResponse.json({
      success: true,
      reward: result.reward,
      balance: result.balanceAfter,
      message: `출석 완료! ${result.reward.toLocaleString()} 프릭을 받았어요 🎉`,
    });
  } catch (e) {
    console.error('출석 보상 오류:', e);
    return NextResponse.json({ error: "출석 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
