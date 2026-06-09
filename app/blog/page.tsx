import Link from "next/link"
import { Metadata } from "next"
import Layout from "@/components/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Eye, Tag } from "lucide-react"
import connectDB from "@/lib/db"
import BlogPost from "@/models/BlogPost"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Blog · PAYPERIC",
  description: "PAYPERIC 상품 소개와 학습 인사이트를 만나보세요.",
}

interface PostRow {
  _id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  tags: string[]
  publishedAt?: Date
  createdAt: Date
  views: number
  authorName: string
}

async function getPublishedPosts(): Promise<PostRow[]> {
  try {
    await connectDB()
    const posts = await BlogPost.find({ status: "published" })
      .select("title slug excerpt coverImage tags publishedAt createdAt views authorName")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(60)
      .lean<PostRow[]>()
    return posts.map((p) => ({ ...p, _id: String(p._id) }))
  } catch (e) {
    console.error("블로그 목록 조회 오류:", e)
    return []
  }
}

function fmt(d?: Date | string) {
  if (!d) return ""
  const date = new Date(d)
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <header className="text-center py-6 sm:py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <FileText className="h-3.5 w-3.5" /> PAYPERIC Blog
          </div>
        </header>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-500">
              <FileText className="h-10 w-10 mx-auto mb-4 text-slate-300" />
              아직 작성된 글이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 pb-16">
            {posts.map((p) => (
              <Link
                key={p._id}
                href={`/blog/${encodeURIComponent(p.slug)}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-slate-200">
                  {p.coverImage ? (
                    <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-emerald-300" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <Calendar className="h-3 w-3" /> {fmt(p.publishedAt || p.createdAt)}
                      <span>·</span>
                      <Eye className="h-3 w-3" /> {p.views}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-slate-500 line-clamp-3">{p.excerpt}</p>
                    )}
                    {p.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            <Tag className="h-2.5 w-2.5 mr-0.5" />
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
