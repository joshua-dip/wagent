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
  User,
  MessageCircle,
  ShoppingCart,
  Check,
  CheckCircle2,
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

const EXAMS = [
  { id: "26년 3월", label: "26년 3월" },
  { id: "25년 3월", label: "25년 3월" },
]

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

const QUESTION_TYPES = [
  { id: "all", label: "전체" },
  { id: "빈칸재배열형(주제)", label: "빈칸재배열형(주제)" },
  { id: "빈칸재배열형(어법)", label: "빈칸재배열형(어법)" },
  { id: "요약문조건영작형", label: "요약문조건영작형" },
]

const KAKAO_INQUIRY_URL =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_CHAT_URL ?? "https://pf.kakao.com/_qxbvtn/chat"

export default function HomePage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const { addToCart, isInCart } = useCart()
  const router = useRouter()

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const [selectedExam, setSelectedExam] = useState("26년 3월")
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

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

  const filteredProducts = products.filter((p) => {
    if (!p.tags?.includes(selectedExam)) return false
    if (selectedGrade && !p.tags?.includes(selectedGrade)) return false
    if (selectedType !== "all" && !p.tags?.includes(selectedType)) return false
    return true
  })

  const toggleGrade = (gradeId: string) => {
    setSelectedGrade((prev) => (prev === gradeId ? null : gradeId))
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price)

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                서술형 자료
              </h1>
            </div>
            <p className="text-slate-500 text-sm sm:text-base ml-[19px]">
              영어모의고사 서술형 문제 · 디지털 자료
            </p>
          </div>

          {/* Exam Period Tabs */}
          <div className="flex gap-2 mb-5 sm:mb-6">
            {EXAMS.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() => {
                  setSelectedExam(exam.id)
                  setSelectedGrade(null)
                  setSelectedType("all")
                }}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                  selectedExam === exam.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {exam.label}
              </button>
            ))}
          </div>

          {/* Grade Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8 sm:mb-10">
            {GRADE_CARDS.map((grade) => {
              const isSelected = selectedGrade === grade.id
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => toggleGrade(grade.id)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl text-left transition-all duration-300 cursor-pointer",
                    "p-4 sm:p-6 lg:p-8",
                    `bg-gradient-to-br ${grade.gradient}`,
                    isSelected
                      ? "ring-2 ring-offset-2 ring-emerald-500 shadow-xl shadow-emerald-900/20 scale-[1.03]"
                      : "opacity-75 hover:opacity-95 hover:shadow-lg hover:shadow-emerald-900/10 hover:scale-[1.01]"
                  )}
                >
                  <span
                    className="absolute -right-2 sm:-right-4 -bottom-4 sm:-bottom-6 text-[80px] sm:text-[120px] lg:text-[150px] font-black text-white/10 leading-none pointer-events-none select-none"
                    aria-hidden
                  >
                    {grade.num}
                  </span>

                  <div className="relative z-10">
                    <span className="inline-block text-[10px] sm:text-xs font-medium text-white/85 bg-white/15 rounded-full px-2 py-0.5 mb-2 sm:mb-3 backdrop-blur-sm">
                      {selectedExam}
                    </span>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white leading-tight">
                      {grade.title}
                    </h3>
                    <p className="hidden sm:block text-xs text-white/70 mt-1.5">
                      서술형 문제 자료
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8 scrollbar-none -mx-1 px-1">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  selectedType === type.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/15"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 text-sm font-medium shadow-lg">
              <CheckCircle2 className="h-4 w-4" />
              {toast}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">자료를 불러오는 중…</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const inCart = isInCart(product._id)
                const isFree = product.price === 0
                return (
                  <div key={product._id} className="group relative rounded-2xl">
                    <Link
                      href={`/products/${product._id}`}
                      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                    >
                      <Card className="h-full border border-slate-200/80 bg-white overflow-hidden transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 group-hover:-translate-y-0.5">
                        <CardContent className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            {product.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {product.tags.filter(t => !['26년 3월', '25년 3월'].includes(t)).slice(0, 2).map((tag) => (
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
                            <span className="shrink-0 text-lg font-bold text-slate-900">
                              {isFree
                                ? "무료"
                                : `${formatPrice(product.price)}원`}
                            </span>
                          </div>

                          <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {product.title}
                          </h3>

                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                            {product.description}
                          </p>

                          <div className="pt-3 border-t border-slate-100" />
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Cart button overlay */}
                    {!isFree && (
                      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!isAuthenticated) { router.push("/auth/simple-signin"); return }
                            if (inCart) { router.push("/cart"); return }
                            addToCart({
                              productId: product._id,
                              title: product.title,
                              price: product.price,
                              originalPrice: product.originalPrice,
                              category: product.category,
                            })
                            showToast("장바구니에 담았습니다")
                          }}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all shadow-sm",
                            inCart
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                        >
                          {inCart ? (
                            <><Check className="h-3.5 w-3.5" />담김</>
                          ) : (
                            <><ShoppingCart className="h-3.5 w-3.5" />담기</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {selectedGrade || selectedType !== "all"
                  ? "해당 조건의 자료가 아직 없어요"
                  : "등록된 자료가 없어요"}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                {selectedGrade || selectedType !== "all"
                  ? "다른 학년이나 유형을 선택해 보세요. 새 자료가 곧 등록됩니다."
                  : "서술형 자료가 곧 등록됩니다. 조금만 기다려 주세요."}
              </p>
              {(selectedGrade || selectedType !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedGrade(null)
                    setSelectedType("all")
                  }}
                  className="border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                >
                  전체 보기
                </Button>
              )}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 sm:mt-16 rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-6 sm:p-8 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
              원하는 자료가 없으신가요?
            </h3>
            <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
              맞춤 서술형 자료 제작도 가능합니다. 카카오톡으로 편하게 문의해 주세요.
            </p>
            <a href={KAKAO_INQUIRY_URL} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                className="font-semibold bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] border-0 shadow-md"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                카카오톡 문의
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
