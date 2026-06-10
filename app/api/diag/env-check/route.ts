import { NextRequest, NextResponse } from "next/server";

const DIAG_TOKEN = "diag-2026-06-10";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (token !== DIAG_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = process.env.ADMIN_EMAIL ?? "";
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const jwt = process.env.NEXTAUTH_SECRET ?? "";

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? null,
    adminEmail: {
      set: email.length > 0,
      value: email,
      length: email.length,
      lowerTrimmed: email.toLowerCase().trim(),
    },
    adminHash: {
      set: hash.length > 0,
      length: hash.length,
      startsWith: hash.slice(0, 7),
      endsWith: hash.slice(-5),
    },
    nextauthSecret: {
      set: jwt.length > 0,
      length: jwt.length,
    },
  });
}
