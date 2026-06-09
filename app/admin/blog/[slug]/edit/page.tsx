"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import BlogPostForm, { BlogFormData } from "@/components/blog/BlogPostForm"
import { Loader2 } from "lucide-react"

export default function EditBlogPostPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = decodeURIComponent(params.slug)
  const [initial, setInitial] = useState<Partial<BlogFormData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
          credentials: "include",
        })
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/simple-signin?next=/admin/blog")
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "글을 불러올 수 없습니다.")
        const p = data.post
        setInitial({
          _id: p._id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || "",
          content: p.content || "",
          coverImage: p.coverImage || "",
          tags: p.tags || [],
          status: p.status,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "오류")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [slug, router])

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> 글 불러오는 중…
        </div>
      ) : error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : initial ? (
        <BlogPostForm mode="edit" identifier={slug} initial={initial} />
      ) : null}
    </AdminLayout>
  )
}
