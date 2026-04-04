"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useCart } from "@/contexts/CartContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileText,
  User,
  Calendar,
  Gift,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Check,
  Loader2,
  CreditCard,
  Eye,
} from "lucide-react"
import Layout from "@/components/Layout"
import { cn } from "@/lib/utils"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  author: string
  createdAt: string
  fileSize: number
  downloadCount: number
  rating: number
  reviewCount: number
  originalFileName: string
  hwpFilePath?: string
  hwpOriginalFileName?: string
  hwpFileSize?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  "shared-materials": "공유자료",
  "original-translation": "원문과 해석",
  "lecture-material": "강의용자료",
  "class-material": "수업용자료",
  "line-translation": "한줄해석",
  "english-writing": "영작하기",
  "translation-writing": "해석쓰기",
  "workbook-blanks": "워크북",
  "order-questions": "글의순서",
  "insertion-questions": "문장삽입",
  "grade1-material": "고1",
  "grade2-material": "고2",
  "grade3-material": "고3",
}

function pathBasename(p: string) {
  const parts = p.split(/[/\\]/)
  return parts[parts.length - 1] || p
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function fileFormatsSummary(p: Product) {
  const hasPdf = p.originalFileName?.toLowerCase().endsWith(".pdf")
  const hasHwp =
    !!(p.hwpFilePath && p.hwpOriginalFileName) ||
    p.originalFileName?.toLowerCase().endsWith(".hwp")
  if (hasPdf && hasHwp && p.hwpFilePath) return "PDF, HWP"
  if (hasPdf) return "PDF"
  if (hasHwp) return "HWP"
  return "파일"
}

export default function ProductDetailPage() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const { addToCart, isInCart } = useCart()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const authLoading = simpleAuth.isLoading || status === "loading"
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" ||
                  (simpleAuth.user as any)?.role === "admin"

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (!productId) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (res.ok) setProduct(data.product)
        else router.push("/")
      } catch {
        router.push("/")
      } finally {
        setLoading(false)
      }
    })()
  }, [productId])

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleDownload = async () => {
    if (!isAuthenticated) { router.push("/auth/simple-signin"); return }
    if (!product) return
    try {
      setDownloading(true)
      const res = await fetch(`/api/products/${productId}/download`)
      const data = await res.json()
      if (!res.ok) {
        showToast("error", data.error || "다운로드 중 오류가 발생했습니다")
        return
      }
      let opened = 0
      if (data.pdfDownloadUrl) {
        window.open(data.pdfDownloadUrl, "_blank")
        opened++
      }
      if (data.hwpDownloadUrl) {
        setTimeout(() => window.open(data.hwpDownloadUrl, "_blank"), 250)
        opened++
      }
      if (opened === 0 && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank")
        opened++
      }
      if (opened > 0) {
        showToast(
          "success",
          opened >= 2 ? "PDF와 HWP 다운로드가 시작되었습니다" : "다운로드가 시작되었습니다"
        )
        setProduct((p) => (p ? { ...p, downloadCount: p.downloadCount + 1 } : null))
      } else {
        showToast("error", "다운로드 링크를 받지 못했습니다")
      }
    } catch {
      showToast("error", "다운로드 중 오류가 발생했습니다")
    } finally {
      setDownloading(false)
    }
  }

  /* ── Loading ── */
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      </Layout>
    )
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">자료를 찾을 수 없습니다</h2>
          <p className="text-sm text-slate-500 mb-6">요청하신 자료가 존재하지 않거나 삭제되었습니다.</p>
          <Button variant="outline" onClick={() => router.push("/")} className="border-emerald-200 text-emerald-800 hover:bg-emerald-50">
            홈으로 돌아가기
          </Button>
        </div>
      </Layout>
    )
  }

  const isFree = product.price === 0
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  const sampleFile = product.tags?.some(t => t.includes("빈칸재배열형(주제)"))
    ? { url: "/samples/sample-blank-topic.pdf", label: "빈칸재배열형(주제) 샘플" }
    : product.tags?.some(t => t.includes("빈칸재배열형(어법)"))
    ? { url: "/samples/sample-blank-grammar.pdf", label: "빈칸재배열형(어법) 샘플" }
    : product.tags?.some(t => t.includes("요약문조건영작형"))
    ? { url: "/samples/sample-summary.pdf", label: "요약문조건영작형 샘플" }
    : null

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Toast */}
          {toast && (
            <div
              className={cn(
                "fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all",
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              )}
            >
              {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {toast.message}
            </div>
          )}

          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ── Main ── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={cn(
                    "rounded-full text-xs font-medium border-0",
                    isFree ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-800"
                  )}>
                    {isFree ? "무료" : "유료"}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full text-xs bg-slate-100 text-slate-600 border-0">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </Badge>
                  {discount && (
                    <Badge className="rounded-full text-xs bg-rose-100 text-rose-700 border-0">
                      {discount}% 할인
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-4">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {product.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7">
                <h2 className="text-base font-semibold text-slate-900 mb-3">자료 설명</h2>
                <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Sample Preview */}
              {sampleFile && (
                <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-5 sm:p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <Eye className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">샘플 미리보기</h3>
                      <p className="text-xs text-slate-500">구매 전에 자료 형태를 확인해 보세요</p>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-sm">
                    <iframe
                      src={sampleFile.url}
                      className="w-full h-[500px] sm:h-[600px]"
                      title={sampleFile.label}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 text-center">
                    {sampleFile.label} — 실제 상품과 동일한 형식입니다
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              {/* Action card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                {isFree ? (
                  /* Free product */
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">무료</p>
                        <p className="text-xs text-slate-500">로그인 후 바로 다운로드</p>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md shadow-emerald-900/10"
                      >
                        {downloading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />다운로드 중…</>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            {product.originalFileName?.toLowerCase().endsWith(".pdf") &&
                            product.hwpFilePath
                              ? "PDF·HWP 다운로드"
                              : "다운로드"}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/auth/simple-signin")}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md shadow-emerald-900/10"
                      >
                        로그인 후 다운로드
                      </Button>
                    )}
                  </>
                ) : (
                  /* Paid product */
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {product.price.toLocaleString()}원
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-5">결제 후 즉시 다운로드</p>

                    <div className="space-y-2.5">
                      {isAdmin ? (
                        <Button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md shadow-emerald-900/10"
                        >
                          {downloading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />다운로드 중…</>
                          ) : (
                            <><Download className="h-4 w-4 mr-2" />관리자 다운로드</>
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              if (!isAuthenticated) { router.push("/auth/simple-signin"); return }
                              router.push(`/products/${product._id}/checkout`)
                            }}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-md shadow-emerald-900/10"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {product.price.toLocaleString()}원 결제하기
                          </Button>

                          {isInCart(product._id) ? (
                            <Button
                              variant="outline"
                              className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                              onClick={() => router.push("/cart")}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              장바구니에 담김
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => {
                                addToCart({
                                  productId: product._id,
                                  title: product.title,
                                  price: product.price,
                                  originalPrice: product.originalPrice,
                                  category: product.category,
                                })
                                showToast("success", "장바구니에 담았습니다")
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              장바구니 담기
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {!isAdmin && (
                      <p className="text-[11px] text-slate-400 text-center mt-3">
                        안전한 결제 시스템으로 보호됩니다
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* File info */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">파일 정보</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">형식</dt>
                    <dd className="font-medium text-slate-700">{fileFormatsSummary(product)}</dd>
                  </div>
                  {product.originalFileName?.toLowerCase().endsWith(".pdf") && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500 shrink-0">PDF</dt>
                      <dd className="font-medium text-slate-700 text-right truncate max-w-[200px]">
                        {pathBasename(product.originalFileName)} · {formatFileSize(product.fileSize)}
                      </dd>
                    </div>
                  )}
                  {product.hwpFilePath && product.hwpOriginalFileName && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500 shrink-0">HWP</dt>
                      <dd className="font-medium text-slate-700 text-right truncate max-w-[200px]">
                        {pathBasename(product.hwpOriginalFileName)} ·{" "}
                        {formatFileSize(product.hwpFileSize ?? 0)}
                      </dd>
                    </div>
                  )}
                  {product.originalFileName?.toLowerCase().endsWith(".hwp") && !product.hwpFilePath && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">크기</dt>
                        <dd className="font-medium text-slate-700">{formatFileSize(product.fileSize)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">파일명</dt>
                        <dd className="font-medium text-slate-700 text-right truncate max-w-[160px]">
                          {product.originalFileName}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
