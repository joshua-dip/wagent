"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  FileText,
  Loader2,
} from "lucide-react"

interface BlogRow {
  _id: string
  title: string
  slug: string
  excerpt?: string
  status: "draft" | "published"
  tags: string[]
  views: number
  publishedAt?: string
  createdAt: string
  authorName: string
}

export default function AdminBlogListPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  const load = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ includeDrafts: "true", limit: "50" })
      if (search) qs.set("search", search)
      if (statusFilter !== "all") qs.set("status", statusFilter)
      const res = await fetch(`/api/blog?${qs.toString()}`, { credentials: "include" })
      if (res.status === 401 || res.status === 403) {
        router.push("/auth/simple-signin?next=/admin/blog")
        return
      }
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`"${title}" 글을 정말 삭제할까요?`)) return
    const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug))
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err.error || "삭제 실패")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" /> 블로그 관리
            </h1>
            <p className="text-sm text-slate-500 mt-1">상품 소개, 공지, 업데이트 글을 작성하세요.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/admin/blog/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-1" /> 새 글 쓰기
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load()
                }}
                placeholder="제목·요약·태그 검색"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
              {(["all", "published", "draft"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded ${
                    statusFilter === s ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s === "all" ? "전체" : s === "published" ? "공개" : "임시"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 flex items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> 불러오는 중…
              </div>
            ) : posts.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                글이 없습니다. 첫 글을 작성해보세요.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <li key={p._id} className="p-4 flex items-start gap-4 hover:bg-slate-50/70">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={
                            p.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }
                        >
                          {p.status === "published" ? "공개" : "임시"}
                        </Badge>
                        <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                      </div>
                      {p.excerpt && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                        <span>/{p.slug}</span>
                        <span>·</span>
                        <span>{new Date(p.publishedAt || p.createdAt).toLocaleString("ko-KR")}</span>
                        <span>·</span>
                        <span>조회 {p.views}</span>
                        {p.tags?.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{p.tags.map((t) => `#${t}`).join(" ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/blog/${encodeURIComponent(p.slug)}`} target="_blank">
                        <Button variant="ghost" size="sm" title="미리보기">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/blog/${encodeURIComponent(p.slug)}/edit`}>
                        <Button variant="ghost" size="sm" title="수정">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="삭제"
                        onClick={() => handleDelete(p.slug, p.title)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
