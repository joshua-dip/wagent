"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

const MIN_CARD_AMOUNT = 100

export default function ProductCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [paying, setPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // 프릭
  const [pricBalance, setPricBalance] = useState(0)
  const [pricToUse, setPricToUse] = useState(0)

  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === "loading"

  const price = product ? Number(product.price) || 0 : 0
  const maxPric = Math.min(pricBalance, price)
  const payable = Math.max(0, price - pricToUse)
  const cardTooSmall = payable > 0 && payable < MIN_CARD_AMOUNT
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n)

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

  // 프릭 잔액 로드
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return
    fetch("/api/pric/balance", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (typeof d?.pric === "number") setPricBalance(d.pric) })
      .catch(() => {})
  }, [authChecked, isAuthenticated])

  // Payment Widget 초기화
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !product) return

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated, product])

  // 프릭 사용액 변경 시 위젯 금액 동기화
  useEffect(() => {
    if (paymentMethodsWidgetRef.current && payable > 0) {
      try { paymentMethodsWidgetRef.current.updateAmount(payable) } catch {}
    }
  }, [payable])

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
        { value: payable > 0 ? payable : (Number(product.price) || 0) },
        { variantKey: "DEFAULT" }
      )
      await pw.renderAgreement("#agreement", { variantKey: "AGREEMENT" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 위젯 초기화에 실패했습니다.")
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    setErrorMessage("")
    if (!product) return
    if (cardTooSmall) {
      setErrorMessage(`카드 결제는 최소 ${MIN_CARD_AMOUNT}원부터 가능합니다. 프릭 사용을 줄이거나 전액 프릭으로 결제하세요.`)
      return
    }
    if (payable > 0 && !paymentWidgetRef.current) {
      alert("결제 위젯이 초기화되지 않았습니다.")
      return
    }

    const usePric = Math.max(0, Math.min(pricToUse, maxPric))
    const newOrderId = `PRODUCT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const cartItems = [{
      productId: product._id,
      title: product.title,
      price,
      category: product.category,
    }]
    setPaying(true)

    // 주문 생성
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: newOrderId, cartItems, totalAmount: price, pricUsed: usePric }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPaying(false)
        setErrorMessage(data.error || "주문 생성에 실패했습니다.")
        return
      }
      if (!data.order?.requiresPayment) {
        router.push(`/payment/success?pricOnly=1&orderId=${encodeURIComponent(newOrderId)}`)
        return
      }
    } catch {
      setPaying(false)
      setErrorMessage("주문 생성 중 오류가 발생했습니다.")
      return
    }

    // 카드 결제
    try {
      if (paymentMethodsWidgetRef.current) {
        try { paymentMethodsWidgetRef.current.updateAmount(payable) } catch {}
      }
      await paymentWidgetRef.current.requestPayment({
        orderId: newOrderId,
        orderName: product.title,
        successUrl: `${window.location.origin}/payment/success?productId=${productId}`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: currentUser?.email || "guest@example.com",
        customerName: currentUser?.name || "고객",
        customerMobilePhone: (currentUser as { phone?: string })?.phone || "01000000000",
      })
    } catch {
      setPaying(false)
      setErrorMessage("결제 요청 중 오류가 발생했습니다.")
    }
  }

  /* ── Error (no product) ── */
  if (error && !product) {
    return (
      <Layout>
        <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
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
      <div className="-mx-3 -mt-4 sm:-mx-6 sm:-mt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            상품으로 돌아가기
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">결제하기</h1>
              {product && <p className="text-sm text-slate-500">{product.title}</p>}
            </div>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {errorMessage}
            </div>
          )}

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
                      <p className="text-xs text-slate-400 line-through">{fmt(Number(product.originalPrice) || 0)}원</p>
                    )}
                    <p className="text-lg font-bold text-slate-900">{fmt(price)}원</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>상품 금액</span>
                    <span>{fmt(price)}원</span>
                  </div>
                  {pricToUse > 0 && (
                    <div className="flex justify-between items-center text-sm text-fuchsia-600">
                      <span>프릭 사용</span>
                      <span>- {fmt(pricToUse)}원</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-900">카드 결제 금액</span>
                    <span className="text-xl font-bold text-emerald-700">{fmt(payable)}원</span>
                  </div>
                </div>
              </div>

              {/* 프릭 사용 */}
              <div className="rounded-2xl border border-fuchsia-100 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  🪙 프릭 사용 <span className="text-xs font-normal text-slate-400">보유 {fmt(pricBalance)} 프릭</span>
                </h2>
                {maxPric > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="number"
                      min={0}
                      max={maxPric}
                      value={pricToUse === 0 ? "" : pricToUse}
                      placeholder="0"
                      onChange={(e) => setPricToUse(Math.max(0, Math.min(Math.trunc(Number(e.target.value) || 0), maxPric)))}
                      className="w-36"
                    />
                    <span className="text-sm text-slate-500">/ 최대 {fmt(maxPric)}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPricToUse(maxPric)}>전액 사용</Button>
                    {pricToUse > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPricToUse(0)}>사용 안 함</Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">사용 가능한 프릭이 없습니다.</p>
                )}
                {cardTooSmall && (
                  <p className="text-xs text-amber-600 mt-2">카드 결제는 최소 {MIN_CARD_AMOUNT}원부터 가능합니다. 프릭 사용을 줄이거나 전액 프릭으로 결제하세요.</p>
                )}
              </div>

              {/* Payment methods (전액 프릭이면 숨김) */}
              <div className={payable > 0 ? "" : "hidden"}>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">결제 수단</h2>
                  <div id="payment-method" className="min-h-[200px]" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 mt-4">
                  <div id="agreement" />
                </div>
              </div>

              {payable === 0 && (
                <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/40 p-5 text-center text-fuchsia-700 font-medium">
                  프릭으로 전액 결제됩니다 — 카드 결제 없이 바로 구매 완료됩니다.
                </div>
              )}

              {/* Pay button */}
              <Button
                onClick={handlePayment}
                disabled={paying || cardTooSmall}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-lg shadow-emerald-900/10 rounded-2xl disabled:opacity-60"
              >
                {paying ? "처리 중..." : payable === 0 ? `프릭 ${fmt(pricToUse)}으로 결제하기` : `${fmt(payable)}원 결제하기`}
              </Button>

              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 p-4">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  디지털 상품은 결제 후 즉시 다운로드가 가능합니다. 환불 정책은{" "}
                  <a href="/refund-policy" className="underline underline-offset-2 hover:text-emerald-950">환불 규정</a>을 참고해 주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
