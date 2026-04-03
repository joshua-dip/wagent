"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileText,
  User,
  Calendar,
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
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
}

interface ApiResponse {
  products: Product[]
  error?: string
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    category?: string
    isFree: boolean
    search?: string
  }
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
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 1) return [1]
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

export default function FreeProductsPage() {
  const { status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pagination, setPagination] = useState<ApiResponse["pagination"] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = useCallback(async (page: number, category: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        free: "true",
        ...(category !== "all" && { category }),
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
        setCurrentPage(page)
      } else {
        console.error("상품 조회 오류:", data.error)
        setProducts([])
      }
    } catch (error) {
      console.error("상품 조회 오류:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(1, "all")
  }, [fetchProducts])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    fetchProducts(1, category)
  }

  const handlePageChange = (page: number) => {
    fetchProducts(page, selectedCategory)
  }


  const resetFilters = () => {
    setSelectedCategory("all")
    setCurrentPage(1)
    fetchProducts(1, "all")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const totalFree = pagination?.total ?? products.length
  const categoryEntries = Object.entries(CATEGORY_LABELS)

  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" aria-hidden />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full">
        {/* 히어로 */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(110,231,183,0.35),transparent),radial-gradient(ellipse_50%_45%_at_100%_40%,rgba(94,234,212,0.18),transparent)]"
            aria-hidden
          />
          <div className="relative px-5 sm:px-10 lg:px-14 py-14 sm:py-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm text-emerald-100/95 mb-5 backdrop-blur-sm">
                <Gift className="w-3.5 h-3.5 text-emerald-300" />
                로그인 없이 둘러보기 좋은 시작점
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-100 bg-clip-text text-transparent">
                  무료 자료
                </span>
                로 먼저 경험해 보세요
              </h1>
              <p className="text-slate-300/95 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                서술형 문제 샘플과 수업 보조 자료를 무료로 제공합니다. 구매 전에 자료 품질을 직접 확인해 보세요.
              </p>
              {!loading && (
                <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-100/90">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    무료 자료 약 <strong className="text-white font-semibold">{totalFree}</strong>건
                  </span>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
                    결제 없이 미리 품질 확인
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
          {/* 필터 */}
          <div className="rounded-2xl border border-emerald-100/90 bg-white/80 backdrop-blur-sm shadow-sm shadow-emerald-900/5 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">카테고리</h2>
                <p className="text-sm text-slate-500 mt-1">영역을 골라 무료 자료만 모아 볼 수 있어요.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 self-start sm:self-auto"
              >
                전체로 초기화
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                )}
              >
                전체
              </button>
              {categoryEntries.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === value
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 목록 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-slate-600 text-sm">무료 자료를 불러오는 중…</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  >
                    <Card className="h-full border border-emerald-100/80 bg-white overflow-hidden transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/8">
                      <div
                        className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      />
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 group-hover:scale-105 transition-transform">
                            <FileText className="h-5 w-5" strokeWidth={2} />
                          </div>
                          <Badge className="shrink-0 bg-emerald-500/15 text-emerald-800 border-0 font-medium">
                            무료
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg leading-snug mb-2 group-hover:text-emerald-800 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {product.author}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {product.downloadCount.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {formatFileSize(product.fileSize)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        {product.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="text-[11px] text-slate-400 self-center">
                                +{product.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-xs font-medium text-emerald-700">
                            {CATEGORY_LABELS[product.category] ?? product.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                            자세히
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="border-emerald-200 hover:bg-emerald-50"
                  >
                    이전
                  </Button>
                  <div className="flex flex-wrap justify-center gap-1">
                    {getVisiblePages(currentPage, pagination.totalPages).map((page) => (
                      <Button
                        key={page}
                        type="button"
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          page === currentPage
                            ? "min-w-[2.25rem] bg-gradient-to-r from-emerald-600 to-teal-600 border-0 shadow-sm"
                            : "min-w-[2.25rem] border-emerald-200 hover:bg-emerald-50"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="border-emerald-200 hover:bg-emerald-50"
                  >
                    다음
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="border-emerald-100/90 shadow-sm overflow-hidden">
              <CardContent className="py-16 sm:py-20 text-center px-6">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                  <FileText className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">이 조건의 무료 자료가 없어요</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  다른 카테고리를 선택하거나 전체 목록으로 돌아가 보세요.
                </p>
                <Button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
                >
                  전체 무료 자료 보기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
