import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import connectDB from "@/lib/db";
import {
  ensureMongoUserFromSupabase,
  issueWagentCookieOnResponse,
  resolveWagentRoleAndId,
} from "@/lib/supabase/mongo-sync";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const base = new URL(request.url).origin;

  if (!url || !key) {
    return NextResponse.redirect(`${base}/auth/simple-signin`);
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const redirectUrl = new URL(nextPath, base);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await connectDB();
        const mongoUser = await ensureMongoUserFromSupabase(user);
        const { id, role } = resolveWagentRoleAndId(mongoUser);
        issueWagentCookieOnResponse(
          response,
          id,
          mongoUser.email,
          mongoUser.name,
          role
        );
      }
      return response;
    }
  }

  return NextResponse.redirect(`${base}/auth/simple-signin?error=auth`);
}
