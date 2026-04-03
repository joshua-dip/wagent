"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useSession } from "next-auth/react"
import { Loader2, AlertCircle, ArrowLeft, FileText, ShieldCheck } from "lucide-react"

declare global {
  interface Window {
    PaymentWidget: any
  }
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  author: string
}

const CATEGORY_LABELS: Record<string, string> = {
  "shared-materials": "공유자료",
  "original-translation": "원문과 해석",
  "lecture-material": "강의용자료",
  "class-material": "수업용자료",
  "workbook-blanks": "워크북",
  "order-questions": "글의순서",
  "insertion-questions": "문장삽입",
  "grade1-material": "고1",
  "grade2-material": "고2",
  "grade3-material": "고3",
}

export default function ProductCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState("")
  const [authChecked, setAuthChecked] = useState(false)

  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === "loading"

  // 상품 정보
  useEffect(() => {
    if (!productId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) throw new Error("상품 정보를 불러올 수 없습니다.")
        const data = await res.json()
        setProduct(data.product ?? data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "상품 정보를 불러올 수 없습니다.")
      }
    })()
  }, [productId])

  // 인증 확인
  useEffect(() => {
    if (isAuthLoading) return
    setAuthChecked(true)
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.")
      router.push("/auth/simple-signin")
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Payment Widget 초기화
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !product) return

    const ts = Date.now()
    const r1 = Math.random().toString(36).substr(2, 9)
    const r2 = Math.random().toString(36).substr(2, 5)
    setOrderId(`PRODUCT_${ts}_${r1}_${r2}`)

    const script = document.createElement("script")
    script.src = "https://js.tosspayments.com/v1/payment-widget"
    script.async = true
    script.onload = () => initializePaymentWidget()
    script.onerror = () => {
      setError("결제 모듈을 불러오는데 실패했습니다.")
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => { script.parentNode?.removeChild(script) }
  }, [authChecked, isAuthenticated, product])

  const initializePaymentWidget = async () => {
    try {
      if (!window.PaymentWidget || !product) throw new Error("결제 위젯을 초기화할 수 없습니다.")

      setIsLoading(false)
      await new Promise((r) => setTimeout(r, 100))

      const wait = (sel: string, ms = 5000) =>
        new Promise<Element>((resolve, reject) => {
          const el = document.querySelector(sel)
          if (el) { resolve(el); return }
          const obs = new MutationObserver(() => {
            const found = document.querySelector(sel)
            if (found) { obs.disconnect(); resolve(found) }
          })
          obs.observe(document.body, { childList: true, subtree: true })
          setTimeout(() => { obs.disconnect(); reject(new Error(`${sel} 요소를 찾을 수 없습니다.`)) }, ms)
        })

      await wait("#payment-method")
      await wait("#agreement")

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5"
      const customerKey = currentUser?.email
        ? btoa(currentUser.email).substring(0, 50)
        : `GUEST_${Date.now()}`

      const pw = window.PaymentWidget(clientKey, customerKey)
      paymentWidgetRef.current = pw

      paymentMethodsWidgetRef.current = pw.renderPaymentMethods(
        "#payment-method",
        { value: Number(product.price) || 0 },
        { variantKey: "DEFAULT" }
      )
      await pw.renderAgreement("#agreement", { variantKey: "AGREEMENT" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 위젯 초기화에 실패했습니다.")
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentWidgetRef.current || !product) {
      alert("결제 위젯이 초기화되지 않았습니다.")
      return
    }
    try {
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: product.title,
        successUrl: `${window.location.origin}/payment/success?productId=${productId}`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: currentUser?.email || "guest@example.com",
        customerName: currentUser?.name || "고객",
        customerMobilePhone: (currentUser as any)?.phone || "01000000000",
      })
    } catch {
      alert("결제 요청 중 오류가 발생했습니다.")
    }
  }

  const price = product ? Number(product.price) || 0 : 0
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n)

  /* ── Error (no product) ── */
  if (error && !product) {
    return (
      <Layout>
        <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Button variant="outline" onClick={() => router.push("/")} className="border-emerald-200 text-emerald-800 hover:bg-emerald-50">
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6 min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            상품으로 돌아가기
          </button>

          {/* Page title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">결제하기</h1>
              {product && (
                <p className="text-sm text-slate-500">
                  {product.title}
                </p>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">결제 준비 중 오류</h3>
              <p className="text-sm text-slate-500 mb-5">{error}</p>
              <Button variant="outline" onClick={() => router.back()}>상품으로 돌아가기</Button>
            </div>
          ) : isLoading || !product ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
              <Loader2 className="h-10 w-10 text-emerald-500 mx-auto mb-4 animate-spin" />
              <h3 className="font-semibold text-slate-900 mb-1">결제 준비 중…</h3>
              <p className="text-sm text-slate-500">잠시만 기다려주세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">주문 상품</h2>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 mb-1.5">{product.title}</p>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0 rounded-full">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </Badge>
                  </div>
                  <div className="text-right shrink-0">
                    {(Number(product.originalPrice) || 0) > price && (
                      <p className="text-xs text-slate-400 line-through">
                        {fmt(Number(product.originalPrice) || 0)}원
                      </p>
                    )}
                    <p className="text-lg font-bold text-slate-900">{fmt(price)}원</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-900">총 결제 금액</span>
                  <span className="text-xl font-bold text-emerald-700">{fmt(price)}원</span>
                </div>
              </div>

              {/* Payment methods (Toss widget) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">결제 수단</h2>
                <div id="payment-method" className="min-h-[200px]" />
              </div>

              {/* Agreement (Toss widget) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                <div id="agreement" />
              </div>

              {/* Pay button */}
              <Button
                onClick={handlePayment}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-lg shadow-emerald-900/10 rounded-2xl"
              >
                {fmt(price)}원 결제하기
              </Button>

              {/* Info */}
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 p-4">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  디지털 상품은 결제 후 즉시 다운로드가 가능합니다. 환불 정책은{" "}
                  <a href="/refund-policy" className="underline underline-offset-2 hover:text-emerald-950">
                    환불 규정
                  </a>
                  을 참고해 주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
