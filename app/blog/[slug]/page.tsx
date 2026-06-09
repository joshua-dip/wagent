import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Layout from "@/components/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Eye, Tag, User } from "lucide-react"
import connectDB from "@/lib/db"
import BlogPost from "@/models/BlogPost"
import { makeExcerpt } from "@/lib/sanitizeHtml"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

interface PostDoc {
  _id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  tags: string[]
  status: "draft" | "published"
  publishedAt?: Date
  createdAt: Date
  views: number
  authorName: string
}

async function getPost(slug: string): Promise<PostDoc | null> {
  try {
    await connectDB()
    const post = await BlogPost.findOne({ slug, status: "published" }).lean<PostDoc>()
    if (!post) return null
    // 비차단 조회수 증가
    BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {})
    return { ...post, _id: String(post._id) }
  } catch (e) {
    console.error("블로그 조회 오류:", e)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(decodeURIComponent(slug))
  if (!post) return { title: "글을 찾을 수 없습니다 · PAYPERIC" }
  const description = post.excerpt || makeExcerpt(post.content)
  return {
    title: `${post.title} · PAYPERIC Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
  }
}

function fmt(d?: Date | string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(decodeURIComponent(slug))
  if (!post) notFound()

  return (
    <Layout>
      <article className="max-w-3xl mx-auto pb-20">
        <div className="pt-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-slate-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> 목록으로
            </Button>
          </Link>
        </div>

        <header className="pt-6 pb-8 text-center sm:text-left">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-3">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-slate-500 text-base">{post.excerpt}</p>
          )}
          <div className="mt-5 flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{post.authorName}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(post.publishedAt || post.createdAt)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div
          className="prose prose-slate max-w-none prose-headings:font-semibold prose-img:rounded-lg prose-img:mx-auto prose-a:text-emerald-600 prose-blockquote:border-emerald-300 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-rose-600 prose-pre:bg-slate-900 prose-pre:text-slate-100"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-slate-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> 다른 글 보기
            </Button>
          </Link>
        </div>
      </article>
    </Layout>
  )
}
