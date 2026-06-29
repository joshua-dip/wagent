"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Layout from "@/components/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { GraduationCap, Loader2, ShoppingCart, Check, FileText } from "lucide-react"

/** 이 태그가 붙은 상품이 이 메뉴에 노출됩니다. (출제기/관리자에서 동일 태그로 업로드) */
const SPECIAL_TAG = "서술형특강교재"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  "shared-materials": "공유자료",
  "english-writing": "영작하기",
  "translation-writing": "해석쓰기",
  "grade1-material": "고1",
  "grade2-material": "고2",
  "grade3-material": "고3",
}

export default function EssaySpecialPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const { addToCart, removeFromCart, isInCart } = useCart()
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/products?tag=${encodeURIComponent(SPECIAL_TAG)}&limit=100`)
        const data = await res.json()
        if (!cancelled && res.ok) setProducts(data.products || [])
      } catch {
        /* 무시 */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n)

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-5xl">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">서술형특강교재</h1>
              <p className="text-sm text-slate-500 mt-0.5">서술형 대비 특강용 교재</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-9 w-9 text-emerald-500 animate-spin" />
              <p className="text-slate-500 text-sm">자료를 불러오는 중…</p>
            </div>
          ) : products.length === 0 ? (
            /* 상품 준비 중 (아직 업로드 전) */
            <div className="text-center py-16 sm:py-24">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">서술형특강교재 준비 중입니다</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                곧 특강용 서술형 교재를 등록할 예정이에요. 조금만 기다려 주세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {products.map((product) => {
                const inCart = isInCart(product._id)
                const isFree = product.price === 0
                return (
                  <div key={product._id} className="group relative rounded-2xl">
                    <Link
                      href={`/products/${product._id}`}
                      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                    >
                      <Card className="h-full overflow-hidden border border-slate-200/90 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 hover:border-emerald-200/90 hover:shadow-lg hover:shadow-emerald-900/[0.07]">
                        <CardContent className="flex flex-col justify-between h-full p-5 sm:p-6 pb-16">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-800 border-0">
                              {CATEGORY_LABELS[product.category] || product.category}
                            </Badge>
                            <div className="shrink-0 text-right">
                              {!isFree && product.originalPrice && product.originalPrice > product.price && (
                                <span className="inline-block mb-0.5 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 tabular-nums">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                              )}
                              <span className={cn("block text-base sm:text-lg font-bold tabular-nums", isFree ? "text-emerald-600" : "text-slate-900")}>
                                {isFree ? "무료" : `${fmt(product.price)}원`}
                              </span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {!isFree && (
                      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!isAuthenticated) { router.push("/auth/simple-signin"); return }
                            if (inCart) { removeFromCart(product._id); return }
                            addToCart({
                              productId: product._id,
                              title: product.title,
                              price: product.price,
                              originalPrice: product.originalPrice,
                              category: product.category,
                            })
                          }}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all shadow-md min-h-[36px]",
                            inCart
                              ? "bg-white text-emerald-700 border-2 border-emerald-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                          )}
                          aria-pressed={inCart}
                        >
                          {inCart ? (<><Check className="h-3.5 w-3.5 shrink-0" />빼기</>) : (<><ShoppingCart className="h-3.5 w-3.5 shrink-0" />담기</>)}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
