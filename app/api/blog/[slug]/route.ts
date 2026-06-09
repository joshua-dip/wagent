import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeHtml, makeExcerpt } from "@/lib/sanitizeHtml";
import { Types } from "mongoose";

type Params = { params: Promise<{ slug: string }> };

async function findPost(slugOrId: string) {
  if (Types.ObjectId.isValid(slugOrId)) {
    const byId = await BlogPost.findById(slugOrId);
    if (byId) return byId;
  }
  return BlogPost.findOne({ slug: slugOrId });
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { slug } = await params;
    const post = await findPost(slug);
    if (!post) {
      return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    }

    // 비공개(draft) 글은 관리자만 조회
    if (post.status !== "published") {
      const gate = await requireAdmin();
      if (!gate.ok) return gate.response;
    } else {
      // 비차단 조회수 증가
      BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {});
    }

    return NextResponse.json({ post: post.toObject() });
  } catch (error) {
    console.error("블로그 조회 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 실패" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    await connectDB();
    const { slug } = await params;
    const post = await findPost(slug);
    if (!post) {
      return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.title === "string") {
      const t = body.title.trim();
      if (!t) return NextResponse.json({ error: "제목은 비울 수 없습니다." }, { status: 400 });
      post.title = t;
    }
    if (typeof body.content === "string") {
      post.content = sanitizeHtml(body.content);
    }
    if (typeof body.excerpt === "string") {
      post.excerpt = body.excerpt.trim() || makeExcerpt(post.content);
    }
    if (typeof body.coverImage === "string") {
      post.coverImage = body.coverImage.trim() || undefined;
    }
    if (Array.isArray(body.tags)) {
      post.tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 20);
    }
    if (typeof body.productId === "string") {
      post.productId = body.productId.trim() || undefined;
    }
    if (typeof body.slug === "string") {
      const newSlug = body.slug.trim().toLowerCase();
      if (newSlug && newSlug !== post.slug) {
        const dup = await BlogPost.findOne({ slug: newSlug, _id: { $ne: post._id } }).lean();
        if (dup) {
          return NextResponse.json({ error: "이미 사용 중인 slug 입니다." }, { status: 409 });
        }
        post.slug = newSlug;
      }
    }
    if (body.status === "published" || body.status === "draft") {
      if (post.status !== body.status) {
        post.status = body.status;
        if (body.status === "published" && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      }
    }

    await post.save();
    return NextResponse.json({ post: post.toObject() });
  } catch (error) {
    console.error("블로그 수정 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "수정 실패" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    await connectDB();
    const { slug } = await params;
    const post = await findPost(slug);
    if (!post) {
      return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    }
    await post.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("블로그 삭제 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "삭제 실패" },
      { status: 500 }
    );
  }
}
