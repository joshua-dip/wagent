"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Eye, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

const BlogEditor = dynamic(() => import("./BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="h-10 border-b border-slate-100 bg-slate-50/80 rounded-t-lg" />
      <div className="min-h-[420px] p-5 text-slate-300">에디터 로딩 중…</div>
    </div>
  ),
})

export interface BlogFormData {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  tags: string[]
  status: "draft" | "published"
}

interface Props {
  mode: "create" | "edit"
  initial?: Partial<BlogFormData>
  /** 수정 모드에서 PATCH 키로 쓰는 식별자 (보통 slug) */
  identifier?: string
}

const empty: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: [],
  status: "draft",
}

export default function BlogPostForm({ mode, initial, identifier }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<BlogFormData>({ ...empty, ...initial })
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(", "))
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({ ...empty, ...initial })
      setTagsInput((initial.tags || []).join(", "))
    }
  }, [initial])

  const submit = async (status: "draft" | "published") => {
    setError(null)
    if (!form.title.trim()) {
      setError("제목을 입력하세요.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        status,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }
      const isCreate = mode === "create"
      const url = isCreate
        ? "/api/blog"
        : `/api/blog/${encodeURIComponent(identifier || form.slug)}`
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "저장 실패")

      if (isCreate) {
        router.push("/admin/blog")
      } else {
        // 슬러그가 바뀌었을 가능성 → 응답값으로 동기화
        const newSlug = data.post?.slug || form.slug
        setForm((f) => ({ ...f, slug: newSlug, status }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패")
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async (file: File) => {
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/blog/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "업로드 실패")
      setForm((f) => ({ ...f, coverImage: data.url }))
    } catch (e) {
      alert(e instanceof Error ? e.message : "업로드 실패")
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> 목록
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "create" ? "새 글 쓰기" : "글 수정"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && form.slug && (
            <Link href={`/blog/${encodeURIComponent(form.slug)}`} target="_blank">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" /> 미리보기
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => submit("draft")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            임시 저장
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => submit("published")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            공개로 저장
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="예: 2026 수능특강 영어 — 단원별 핵심 정리"
                className="text-lg font-semibold"
              />
              <Label htmlFor="excerpt" className="mt-2 block">요약 <span className="text-slate-400 font-normal">(선택)</span></Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="목록과 SNS 미리보기에 노출됩니다. 비워두면 본문에서 자동 추출돼요."
                rows={2}
              />
            </CardContent>
          </Card>

          <BlogEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            placeholder="상품에 대해 자유롭게 작성하세요. 이미지·표·코드·인용 등 모든 서식을 지원합니다."
          />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div>
                <Label className="block mb-1.5">대표 이미지</Label>
                {form.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.coverImage}
                      alt="대표 이미지"
                      className="w-full aspect-video object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                      className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded hover:bg-black/80"
                    >
                      제거
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30">
                    {coverUploading ? (
                      <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    )}
                    <span>{coverUploading ? "업로드 중…" : "이미지 업로드"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) uploadCover(f)
                        e.target.value = ""
                      }}
                    />
                  </label>
                )}
                <Input
                  className="mt-2 text-xs"
                  placeholder="또는 이미지 URL 붙여넣기"
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <Label htmlFor="slug">URL 슬러그</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="비우면 제목으로 자동 생성"
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-slate-400">
                /blog/{form.slug || "자동-생성"}
              </p>

              <Label htmlFor="tags" className="mt-2 block">태그</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="쉼표로 구분 (예: 영어, 수능, 부교재)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-xs text-slate-500">
                <strong className="text-slate-700">팁:</strong> 본문에서{" "}
                <kbd className="bg-slate-100 rounded px-1 text-[10px]">Cmd+B</kbd>{" "}
                굵게,{" "}
                <kbd className="bg-slate-100 rounded px-1 text-[10px]">Cmd+I</kbd>{" "}
                기울임,{" "}
                <kbd className="bg-slate-100 rounded px-1 text-[10px]">Cmd+Z</kbd>{" "}
                되돌리기. 이미지는 툴바에서 업로드하거나 URL을 붙여넣을 수 있어요.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
