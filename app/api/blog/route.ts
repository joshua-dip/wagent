import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeHtml, makeExcerpt, makeSlug } from "@/lib/sanitizeHtml";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const status = searchParams.get("status"); // admin only filter
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const filter: Record<string, unknown> = {};
    if (!includeDrafts) {
      filter.status = "published";
    } else if (status === "draft" || status === "published") {
      filter.status = status;
    }
    if (tag) filter.tags = { $in: tag.split(",") };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // includeDrafts 요청은 관리자만
    if (includeDrafts) {
      const gate = await requireAdmin();
      if (!gate.ok) return gate.response;
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .select("title slug excerpt coverImage tags status publishedAt createdAt views authorName")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + posts.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("블로그 목록 조회 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 실패" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    await connectDB();
    const body = await request.json();
    const title = (body.title || "").toString().trim();
    if (!title) {
      return NextResponse.json({ error: "제목은 필수입니다." }, { status: 400 });
    }
    const rawContent = (body.content || "").toString();
    const content = sanitizeHtml(rawContent);

    const status: "draft" | "published" =
      body.status === "published" ? "published" : "draft";

    let slug = (body.slug || "").toString().trim().toLowerCase();
    if (!slug) slug = makeSlug(title);
    // 중복 슬러그면 suffix 추가
    let candidate = slug;
    let n = 1;
    while (await BlogPost.findOne({ slug: candidate }).lean()) {
      n += 1;
      candidate = `${slug}-${n}`;
    }
    slug = candidate;

    const tags = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 20)
      : [];

    const excerpt = (body.excerpt || "").toString().trim() || makeExcerpt(content);
    const coverImage = (body.coverImage || "").toString().trim() || undefined;
    const productId = (body.productId || "").toString().trim() || undefined;

    const doc = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      tags,
      status,
      productId,
      authorEmail: gate.admin.email,
      authorName: gate.admin.name,
      publishedAt: status === "published" ? new Date() : undefined,
    });

    return NextResponse.json({ post: doc.toObject() }, { status: 201 });
  } catch (error) {
    console.error("블로그 생성 오류:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "생성 실패" },
      { status: 500 }
    );
  }
}
