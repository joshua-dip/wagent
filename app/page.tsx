"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useCart } from "@/contexts/CartContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  FileText,
  Loader2,
  ShoppingCart,
  Check,
  X,
  ArrowRight,
  Download,
} from "lucide-react"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  author: string
  downloadCount: number
  rating: number
  reviewCount: number
  createdAt: string
  fileSize: number
}

const GRADE_CARDS = [
  {
    id: "고1",
    num: "1",
    title: "고1 영어모의고사",
    gradient: "from-emerald-400 via-emerald-500 to-teal-500",
  },
  {
    id: "고2",
    num: "2",
    title: "고2 영어모의고사",
    gradient: "from-teal-400 via-teal-500 to-emerald-500",
  },
  {
    id: "고3",
    num: "3",
    title: "고3 영어모의고사",
    gradient: "from-emerald-500 via-teal-600 to-emerald-600",
  },
]

const EXAMS = [
  { id: "26년 5월", label: "26년 5월" },
  { id: "26년 3월", label: "26년 3월" },
  { id: "25년 3월", label: "25년 3월" },
]

const EXAM_GRADES: Record<string, readonly string[]> = {
  "26년 5월": ["고3"],
  "26년 3월": ["고1", "고2", "고3"],
  "25년 3월": ["고1", "고2", "고3"],
}

const DIFFICULTY_ORDER = ["최고난도", "고난도", "중난도", "기본난도"] as const
type DifficultyLevel = (typeof DIFFICULTY_ORDER)[number]

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  {
    label: string
    level: number
    accent: string
    border: string
    bg: string
    badge: string
    bar: string
    text: string
  }
> = {
  최고난도: {
    label: "최고난도",
    level: 4,
    accent: "from-rose-500 to-red-600",
    border: "border-rose-200/90 hover:border-rose-300",
    bg: "bg-gradient-to-br from-rose-50/90 via-white to-white",
    badge: "bg-rose-100 text-rose-800 ring-1 ring-rose-200/80",
    bar: "bg-rose-500",
    text: "text-rose-800",
  },
  고난도: {
    label: "고난도",
    level: 3,
    accent: "from-orange-500 to-amber-600",
    border: "border-orange-200/90 hover:border-orange-300",
    bg: "bg-gradient-to-br from-orange-50/90 via-white to-white",
    badge: "bg-orange-100 text-orange-800 ring-1 ring-orange-200/80",
    bar: "bg-orange-500",
    text: "text-orange-800",
  },
  중난도: {
    label: "중난도",
    level: 2,
    accent: "from-amber-400 to-yellow-500",
    border: "border-amber-200/90 hover:border-amber-300",
    bg: "bg-gradient-to-br from-amber-50/80 via-white to-white",
    badge: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/80",
    bar: "bg-amber-400",
    text: "text-amber-900",
  },
  기본난도: {
    label: "기본난도",
    level: 1,
    accent: "from-emerald-400 to-teal-500",
    border: "border-emerald-200/90 hover:border-emerald-300",
    bg: "bg-gradient-to-br from-emerald-50/80 via-white to-white",
    badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
    bar: "bg-emerald-500",
    text: "text-emerald-800",
  },
}

function getDifficultyLevel(product: Product): DifficultyLevel | null {
  return DIFFICULTY_ORDER.find((d) => product.tags?.includes(d)) ?? null
}

function isFullSet(product: Product) {
  return product.tags?.includes("전체") || product.title.includes("풀세트")
}

function isDifficultyBundle(product: Product) {
  return product.tags?.includes("난이도별")
}

function isNumberItem(product: Product) {
  return !isFullSet(product) && !isDifficultyBundle(product)
}

function sortByQuestionNumber(a: Product, b: Product) {
  const parseNum = (title: string) => {
    const range = title.match(/(\d+)~(\d+)번/)
    if (range) return parseInt(range[1], 10)
    const single = title.match(/(\d+)번/)
    return single ? parseInt(single[1], 10) : 999
  }
  return parseNum(a.title) - parseNum(b.title)
}

function sortByDifficulty(a: Product, b: Product) {
  const idx = (p: Product) => {
    const level = DIFFICULTY_ORDER.find((d) => p.tags?.includes(d))
    return level ? DIFFICULTY_ORDER.indexOf(level) : 99
  }
  return idx(a) - idx(b)
}

export default function HomePage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const { addToCart, isInCart, cartItems, removeFromCart } = useCart()
  const router = useRouter()

  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const [selectedGrade, setSelectedGrade] = useState<string>("고3")
  const [selectedExam, setSelectedExam] = useState("26년 5월")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?limit=100")
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("상품 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const visibleExams = EXAMS.filter((e) =>
    (EXAM_GRADES[e.id] ?? ["고1", "고2", "고3"]).includes(selectedGrade)
  )

  useEffect(() => {
    if (!visibleExams.some((e) => e.id === selectedExam)) {
      const fallback = visibleExams[0]
      if (fallback) setSelectedExam(fallback.id)
    }
  }, [selectedGrade, selectedExam, visibleExams])

  const filteredProducts = products.filter((p) => {
    if (!p.tags?.includes(selectedGrade)) return false
    if (!p.tags?.includes(selectedExam)) return false
    return true
  })

  const fullSetProducts = filteredProducts.filter(isFullSet)
  const difficultyProducts = filteredProducts
    .filter(isDifficultyBundle)
    .sort(sortByDifficulty)
  const numberProducts = filteredProducts
    .filter(isNumberItem)
    .sort(sortByQuestionNumber)
  const freeSampleCount = numberProducts.filter((p) => p.price === 0).length

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price)

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price, 0)

  const handleFreeDownload = async (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      router.push("/auth/simple-signin")
      return
    }
    try {
      setDownloadingId(productId)
      const res = await fetch(`/api/products/${productId}/download`)
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "다운로드 중 오류가 발생했습니다.")
        return
      }
      if (data.pdfDownloadUrl) window.open(data.pdfDownloadUrl, "_blank")
      else if (data.downloadUrl) window.open(data.downloadUrl, "_blank")
      if (data.hwpDownloadUrl) {
        setTimeout(() => window.open(data.hwpDownloadUrl, "_blank"), 250)
      }
    } catch {
      alert("다운로드 중 오류가 발생했습니다.")
    } finally {
      setDownloadingId(null)
    }
  }

  const renderProductCard = (
    product: Product,
    variant: "full" | "default" | "difficulty" | "number"
  ) => {
    const inCart = isInCart(product._id)
    const isFree = product.price === 0
    const isBundle = variant === "full"
    const difficulty = variant === "difficulty" ? getDifficultyLevel(product) : null
    const diffStyle = difficulty ? DIFFICULTY_CONFIG[difficulty] : null

    return (
      <div
        key={product._id}
        className={cn(
          "group relative rounded-2xl",
          isBundle && "sm:col-span-2 lg:col-span-3",
          isFree && "ring-2 ring-emerald-200/80 ring-offset-1"
        )}
      >
        <Link
          href={`/products/${product._id}`}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          <Card
            className={cn(
              "h-full overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-0.5",
              isBundle
                ? "border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10"
                : diffStyle
                  ? cn(diffStyle.bg, diffStyle.border, "border hover:shadow-lg")
                  : isFree
                    ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-300 hover:shadow-lg"
                    : "border border-slate-200/90 bg-white hover:border-emerald-200/90 hover:shadow-lg hover:shadow-emerald-900/[0.07]"
            )}
          >
            {isBundle && (
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
            )}
            {diffStyle && (
              <div className={cn("h-1.5 w-full bg-gradient-to-r", diffStyle.accent)} />
            )}
            <CardContent className="flex flex-col justify-between h-full p-5 sm:p-6 pb-16 sm:pb-[4.25rem]">
              {diffStyle ? (
                <>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-2 min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-bold",
                          diffStyle.badge
                        )}
                      >
                        {diffStyle.label}
                      </span>
                      <div className="flex items-center gap-1" aria-label={`난이도 ${diffStyle.level}단계`}>
                        {DIFFICULTY_ORDER.map((d) => (
                          <span
                            key={d}
                            className={cn(
                              "h-2 flex-1 max-w-[2rem] rounded-full",
                              DIFFICULTY_CONFIG[d].level <= diffStyle.level
                                ? diffStyle.bar
                                : "bg-slate-200/80"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="inline-block mb-0.5 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 tabular-nums">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      )}
                      <span className="block text-base sm:text-lg font-bold tabular-nums text-slate-900">
                        {formatPrice(product.price)}원
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-[11px] text-slate-400 line-through tabular-nums">
                          {formatPrice(product.originalPrice)}원
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className={cn("text-lg sm:text-xl font-bold leading-tight", diffStyle.text)}>
                      {diffStyle.label} 전체
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5">18~45번 · 25문항 묶음</p>
                  </div>
                </>
              ) : (
              <>
              <div className="flex items-start justify-between gap-3 mb-3">
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags
                      .filter((t) => !["26년 3월", "25년 3월", "난이도별"].includes(t))
                      .slice(0, 2)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-800 border-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                )}
                <div className="shrink-0 text-right">
                  {!isFree &&
                    product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="inline-block mb-0.5 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 tabular-nums">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  <span
                    className={cn(
                      "block text-base sm:text-lg font-bold tabular-nums",
                      isFree ? "text-emerald-600" : "text-slate-900"
                    )}
                  >
                    {isFree ? "무료" : `${formatPrice(product.price)}원`}
                  </span>
                  {!isFree &&
                    product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-[11px] text-slate-400 line-through tabular-nums">
                        {formatPrice(product.originalPrice)}원
                      </p>
                    )}
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {product.title}
                </h3>
                {isBundle && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    18~45번 전 문항 · 4난이도 풀세트
                  </p>
                )}
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </Link>

        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10">
          {isFree ? (
            <button
              type="button"
              onClick={(e) => handleFreeDownload(e, product._id)}
              disabled={downloadingId === product._id}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all shadow-md min-h-[36px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70"
            >
              {downloadingId === product._id ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  받는 중
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  다운로드
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isAuthenticated) {
                  router.push("/auth/simple-signin")
                  return
                }
                if (inCart) {
                  removeFromCart(product._id)
                  return
                }
                addToCart({
                  productId: product._id,
                  title: product.title,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  category: product.category,
                })
                setDrawerOpen(true)
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all shadow-md min-h-[36px]",
                inCart
                  ? "bg-white text-emerald-700 border-2 border-emerald-200 shadow-emerald-900/10 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25"
              )}
              aria-pressed={inCart}
            >
              {inCart ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  빼기
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                  담기
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderSection = (
    title: string,
    subtitle: string,
    items: Product[],
    variant: "full" | "default" | "difficulty" | "number"
  ) => {
    if (items.length === 0) return null

    const cardVariant = variant === "number" ? "default" : variant

    return (
      <section className="mb-10 sm:mb-12 last:mb-0 pt-10 sm:pt-12 border-t border-slate-100 first:pt-0 first:border-t-0">
        <div className="mb-4 sm:mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
            {variant === "difficulty" && (
              <div className="flex flex-wrap gap-2 mt-3">
                {DIFFICULTY_ORDER.map((d) => (
                  <span
                    key={d}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      DIFFICULTY_CONFIG[d].badge
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", DIFFICULTY_CONFIG[d].bar)} />
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className={cn(
            "grid gap-4 sm:gap-5",
            variant === "difficulty"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {items.map((product) => renderProductCard(product, cardVariant))}
        </div>
      </section>
    )
  }

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full">
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 transition-all duration-300 ease-out max-w-5xl",
            drawerOpen && "lg:pr-[21rem]"
          )}
        >
          {/* Grade Cards (primary) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
            {GRADE_CARDS.map((grade) => {
              const isSelected = selectedGrade === grade.id
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGrade(grade.id)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl text-left transition-all duration-300 cursor-pointer",
                    "p-4 sm:p-6 lg:p-8",
                    `bg-gradient-to-br ${grade.gradient}`,
                    isSelected
                      ? "ring-2 ring-offset-2 ring-white/90 shadow-xl shadow-emerald-900/25 scale-[1.02]"
                      : "opacity-80 hover:opacity-100 hover:shadow-lg hover:shadow-emerald-900/10 hover:scale-[1.01]"
                  )}
                >
                  <span
                    className="absolute -right-2 sm:-right-4 -bottom-4 sm:-bottom-6 text-[80px] sm:text-[120px] lg:text-[150px] font-black text-white/10 leading-none pointer-events-none select-none"
                    aria-hidden
                  >
                    {grade.num}
                  </span>

                  <div className="relative z-10">
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white leading-tight">
                      {grade.title}
                    </h3>
                    <p className="hidden sm:block text-xs text-white/70 mt-1.5">
                      조건영작배열
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Exam Period */}
          <div className="sticky top-28 sm:top-[7.25rem] z-20 -mx-1 px-1 py-2 mb-4 sm:mb-6 bg-gradient-to-b from-white via-white/95 to-transparent">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {visibleExams.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => setSelectedExam(exam.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    selectedExam === exam.id
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/15 ring-2 ring-emerald-200/80 ring-offset-2"
                      : "bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-800"
                  )}
                >
                  {exam.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Sections */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">자료를 불러오는 중…</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              {freeSampleCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("section-number")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className="w-full text-left mb-6 sm:mb-8 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-teal-50/60 px-4 py-3 sm:px-5 sm:py-4 transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-900/5 active:scale-[0.998]"
                  aria-label="번호별 섹션으로 이동"
                >
                  <span className="shrink-0 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white">
                    무료
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-900">
                      먼저 {freeSampleCount}개 문항을 무료로 체험해 보세요
                    </p>
                    <p className="text-xs text-emerald-700/80 mt-0.5">
                      번호별 섹션에서 무료 표시된 자료를 다운로드할 수 있어요
                    </p>
                  </div>
                  <ArrowRight className="shrink-0 h-4 w-4 text-emerald-600" />
                </button>
              )}
              {renderSection(
                "풀세트",
                "전 문항 × 전 난이도를 한 번에",
                fullSetProducts,
                "full"
              )}
              {renderSection(
                "난이도별",
                "한 난이도의 전체 문항 묶음",
                difficultyProducts,
                "difficulty"
              )}
              <div id="section-number" className="scroll-mt-32 sm:scroll-mt-36">
                {renderSection(
                  "번호별",
                  "문항 단위 · 4단계 난이도 포함",
                  numberProducts,
                  "number"
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                해당 조건의 자료가 아직 없어요
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                {selectedGrade} · {selectedExam} 자료가 곧 등록됩니다.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Cart Drawer - non-blocking slide panel */}
      <aside
        className={cn(
          "fixed top-[7rem] sm:top-[7.75rem] right-0 bottom-0 w-full max-w-xs bg-white border-l border-slate-200/90 shadow-[0_0_40px_-10px_rgba(15,23,42,0.2)] flex flex-col z-40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-tl-2xl rounded-bl-none overflow-hidden",
          drawerOpen
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full pointer-events-none"
        )}
        aria-hidden={!drawerOpen}
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900 text-sm">
              담은 자료
              <span className="ml-1.5 text-xs font-normal text-slate-500">
                {cartItems.length}개
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 px-2 text-slate-400 text-sm leading-relaxed">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-slate-200" aria-hidden />
              담은 자료가 없습니다.
              <p className="text-xs text-slate-400 mt-2">유료 자료의 담기를 누르면 여기에 모입니다.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cartItems.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      {formatPrice(item.price)}원
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="shrink-0 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                    aria-label={`${item.title} 제거`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">합계</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPrice(cartTotal)}원
              </span>
            </div>
            <Button
              type="button"
              onClick={() => router.push("/cart")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold h-10 text-sm shadow-md"
            >
              장바구니로 이동
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        )}
      </aside>
    </Layout>
  )
}
