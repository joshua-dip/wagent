import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

/** 현재 로그인 사용자 { id, email }. NextAuth 세션 또는 wagent-auth JWT 쿠키. */
export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const u = session.user as { id?: string; email?: string };
    if (u.id) return { id: String(u.id), email: String(u.email) };
    // 세션에 id 가 없으면 아래 JWT 로 폴백
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("wagent-auth")?.value;
  if (token) {
    try {
      const d = verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as { id?: string; _id?: string; email?: string };
      const id = d.id || d._id;
      if (id && d.email) return { id: String(id), email: String(d.email) };
    } catch {
      return null;
    }
  }
  return null;
}
