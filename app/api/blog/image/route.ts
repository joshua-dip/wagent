import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/s3Config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key || !key.startsWith("blog-images/")) {
      return NextResponse.json({ error: "잘못된 키" }, { status: 400 });
    }
    const cmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const signed = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
    // 짧은 응답 캐시. 만료 전이라면 그대로 사용.
    return NextResponse.redirect(signed, {
      status: 302,
      headers: { "Cache-Control": "public, max-age=600" },
    });
  } catch (error) {
    console.error("블로그 이미지 조회 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 실패" },
      { status: 500 }
    );
  }
}
