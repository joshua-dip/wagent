import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/adminAuth";
import { s3Client, BUCKET_NAME } from "@/lib/s3Config";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다 (png, jpg, webp, gif, svg)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "파일이 너무 큽니다 (최대 8MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] || "").toLowerCase();
    const safeBase = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9가-힣_-]/g, "_")
      .slice(0, 60);
    const key = `blog-images/${Date.now()}_${safeBase || "image"}${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = `/api/blog/image?key=${encodeURIComponent(key)}`;
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("블로그 이미지 업로드 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드 실패" },
      { status: 500 }
    );
  }
}
