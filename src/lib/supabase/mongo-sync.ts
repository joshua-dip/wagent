import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import UserModel from "@/models/User";
import type { IUser } from "@/models/User";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export const WAGENT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export function resolveWagentRoleAndId(mongoUser: IUser): {
  id: string;
  role: "admin" | "user";
} {
  const email = mongoUser.email?.toLowerCase() || "";
  if (email === "wnsrb2898@naver.com") {
    return { id: "admin", role: "admin" };
  }
  return { id: mongoUser._id.toString(), role: "user" };
}

export function signWagentToken(
  id: string,
  email: string,
  name: string,
  role: "admin" | "user"
) {
  return jwt.sign({ id, email, name, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function issueWagentCookieOnResponse(
  response: NextResponse,
  id: string,
  email: string,
  name: string,
  role: "admin" | "user"
) {
  const token = signWagentToken(id, email, name, role);
  response.cookies.set("wagent-auth", token, WAGENT_COOKIE_OPTIONS);
}

/**
 * Supabase Auth 사용자와 MongoDB User 동기화 (이메일 기준 연결 또는 신규 생성)
 */
export async function ensureMongoUserFromSupabase(
  supabaseUser: SupabaseAuthUser
): Promise<IUser> {
  const email = (supabaseUser.email || "").toLowerCase().trim();
  if (!email) {
    throw new Error("Supabase 사용자에 이메일이 없습니다.");
  }

  let doc = await UserModel.findOne({ supabaseUserId: supabaseUser.id });
  if (!doc) {
    doc = await UserModel.findOne({ email });
  }

  const fullName =
    (supabaseUser.user_metadata?.full_name as string | undefined) ||
    (supabaseUser.user_metadata?.name as string | undefined) ||
    email.split("@")[0] ||
    "사용자";

  if (!doc) {
    const placeholderPassword = `supabase_${crypto.randomBytes(24).toString("hex")}`;
    doc = await UserModel.create({
      email,
      password: placeholderPassword,
      name: fullName.slice(0, 20),
      supabaseUserId: supabaseUser.id,
      signupMethod: "email",
      emailVerified: !!supabaseUser.email_confirmed_at,
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
      isActive: true,
    });
    return doc;
  }

  if (!doc.supabaseUserId) {
    doc.supabaseUserId = supabaseUser.id;
  }
  if (supabaseUser.email_confirmed_at) {
    doc.emailVerified = true;
  }
  if (fullName && doc.name !== fullName) {
    doc.name = fullName.slice(0, 20);
  }
  await doc.save();
  return doc;
}
