import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getPricStatus } from "@/lib/pric";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 현재 로그인 사용자의 프릭 잔액. 결제 화면에서 사용. */
export async function GET(_request: NextRequest) {
  let currentUser: { id?: string; _id?: string; email?: string } | null = null;
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    currentUser = session.user as { id?: string; email?: string };
  } else {
    const cookieStore = await cookies();
    const token = cookieStore.get("wagent-auth")?.value;
    if (token) {
      try {
        currentUser = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as { id?: string; _id?: string; email?: string };
      } catch {
        currentUser = null;
      }
    }
  }

  const userId = currentUser?.id || currentUser?._id;
  if (!userId) {
    return NextResponse.json({ pric: 0, authenticated: false, attendanceToday: false });
  }

  try {
    const { pric, attendanceToday } = await getPricStatus(String(userId));
    return NextResponse.json({ pric, attendanceToday, authenticated: true });
  } catch (e) {
    console.error('프릭 잔액 조회 오류:', e);
    return NextResponse.json({ pric: 0, authenticated: true, attendanceToday: false });
  }
}
