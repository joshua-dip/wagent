"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { Loader2, ShoppingCart, AlertCircle, ChevronLeft } from 'lucide-react'

declare global {
  interface Window {
    PaymentWidget: any
  }
}

/** 카드 결제 최소 금액 — 그 미만(0 제외)이면 전액 프릭 또는 프릭 축소 유도. */
const MIN_CARD_AMOUNT = 100

export default function CartCheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const { cartItems, clearCart } = useCart()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [paying, setPaying] = useState(false)

  // 프릭
  const [pricBalance, setPricBalance] = useState(0)
  const [pricToUse, setPricToUse] = useState(0)

  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)

  // 인증 확인
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === 'loading'

  // 총 금액 계산 (price가 문자열로 저장된 경우 NaN 방지)
  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
  const maxPric = Math.min(pricBalance, totalAmount)
  const payable = Math.max(0, totalAmount - pricToUse)
  const cardTooSmall = payable > 0 && payable < MIN_CARD_AMOUNT

  // 인증 상태 확인
  useEffect(() => {
    if (isAuthLoading) return
    setAuthChecked(true)
    if (!isAuthenticated) {
      setErrorMessage('결제하려면 카카오 로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      const id = window.setTimeout(() => router.push('/auth/simple-signin'), 300)
      return () => clearTimeout(id)
    }
    if (cartItems.length === 0) {
      setErrorMessage('장바구니가 비어 있어 결제할 수 없습니다.')
      const id = window.setTimeout(() => router.push('/cart'), 300)
      return () => clearTimeout(id)
    }
  }, [isAuthLoading, isAuthenticated, cartItems.length, router])

  // 프릭 잔액 로드
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return
    fetch('/api/pric/balance', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (typeof d?.pric === 'number') setPricBalance(d.pric) })
      .catch(() => { /* 무시 */ })
  }, [authChecked, isAuthenticated])

  // Payment Widget 초기화 (주문 생성은 결제 시점으로 미룸)
  useEffect(() => {
    if (!authChecked || !isAuthenticated || cartItems.length === 0) return

    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment-widget'
    script.async = true
    script.onload = () => { initializePaymentWidget() }
    script.onerror = () => { setError('결제 모듈을 불러오는데 실패했습니다.'); setIsLoading(false) }
    document.body.appendChild(script)

    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated, cartItems.length])

  // 프릭 사용액이 바뀌면 위젯 결제 금액 동기화
  useEffect(() => {
    if (paymentMethodsWidgetRef.current && payable > 0) {
      try { paymentMethodsWidgetRef.current.updateAmount(payable) } catch { /* 무시 */ }
    }
  }, [payable])

  const initializePaymentWidget = async () => {
    try {
      if (!window.PaymentWidget) throw new Error('PaymentWidget을 불러올 수 없습니다.')

      const waitForElement = (selector: string, timeout = 5000) =>
        new Promise<Element>((resolve, reject) => {
          const el = document.querySelector(selector)
          if (el) { resolve(el); return }
          const observer = new MutationObserver(() => {
            const found = document.querySelector(selector)
            if (found) { observer.disconnect(); resolve(found) }
          })
          observer.observe(document.body, { childList: true, subtree: true })
          setTimeout(() => { observer.disconnect(); reject(new Error(`${selector} 요소를 찾을 수 없습니다.`)) }, timeout)
        })

      setIsLoading(false)
      await new Promise(resolve => setTimeout(resolve, 100))
      await waitForElement('#payment-method')
      await waitForElement('#agreement')

      const widgetClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5'
      const customerKey = currentUser?.email
        ? btoa(currentUser.email).substring(0, 50)
        : `GUEST_${Date.now()}`

      const paymentWidget = window.PaymentWidget(widgetClientKey, customerKey)
      paymentWidgetRef.current = paymentWidget

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        '#payment-method',
        { value: payable > 0 ? payable : totalAmount },
        { variantKey: 'DEFAULT' }
      )
      paymentMethodsWidgetRef.current = paymentMethodsWidget

      await paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' })
    } catch (err) {
      console.error('Payment Widget 초기화 오류:', err)
      setError(err instanceof Error ? err.message : '결제 위젯 초기화에 실패했습니다.')
      setIsLoading(false)
    }
  }

  const genOrderId = () => {
    const micro = performance.now().toString().replace('.', '').slice(-6)
    const r1 = Math.random().toString(36).substr(2, 9)
    const r2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `CART_${Date.now()}_${micro}_${r1}_${r2}`
  }

  const handlePayment = async () => {
    setErrorMessage('')
    if (cardTooSmall) {
      setErrorMessage(`카드 결제는 최소 ${MIN_CARD_AMOUNT}원부터 가능합니다. 프릭 사용을 줄이거나 전액 프릭으로 결제하세요.`)
      return
    }
    if (payable > 0 && !paymentWidgetRef.current) {
      setErrorMessage('결제 위젯이 초기화되지 않았습니다.')
      return
    }

    const usePric = Math.max(0, Math.min(pricToUse, maxPric))
    const newOrderId = genOrderId()
    setPaying(true)

    // 주문 생성 (선택한 프릭 반영)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: newOrderId, cartItems, totalAmount, pricUsed: usePric }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPaying(false)
        setErrorMessage(data.error || '주문 생성에 실패했습니다.')
        return
      }

      // 전액 프릭 결제 → Toss 없이 success 페이지에서 확정
      if (!data.order?.requiresPayment) {
        router.push(`/payment/success?pricOnly=1&orderId=${encodeURIComponent(newOrderId)}`)
        return
      }
    } catch {
      setPaying(false)
      setErrorMessage('주문 생성 중 오류가 발생했습니다.')
      return
    }

    // 카드 결제 — 위젯 금액을 payable 로 맞추고 결제 요청
    try {
      if (paymentMethodsWidgetRef.current) {
        try { paymentMethodsWidgetRef.current.updateAmount(payable) } catch { /* 무시 */ }
      }
      const orderName = cartItems.length === 1
        ? cartItems[0].title
        : `${cartItems[0].title} 외 ${cartItems.length - 1}건`

      await paymentWidgetRef.current.requestPayment({
        orderId: newOrderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success?isCart=true`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: currentUser?.email || 'guest@example.com',
        customerName: currentUser?.name || '고객',
        customerMobilePhone: (currentUser as { phone?: string })?.phone || '01000000000',
      })
    } catch (err) {
      console.error('결제 요청 오류:', err)
      setPaying(false)
      setErrorMessage('결제 요청 중 오류가 발생했습니다.')
    }
  }

  const categories: { [key: string]: string } = {
    'shared-materials': '공유자료',
    'original-translation': '원문과 해석',
    'lecture-material': '강의용자료',
    'class-material': '수업용자료',
    'line-translation': '한줄해석',
    'english-writing': '영작하기',
    'translation-writing': '해석쓰기',
    'workbook-blanks': '워크북',
    'order-questions': '글의순서',
    'insertion-questions': '문장삽입',
    'ebs-lecture': 'EBS강의',
    'ebs-workbook': 'EBS워크북',
    'ebs-test': 'EBS평가',
    'reading-comprehension': '독해연습',
    'reading-strategy': '독해전략',
    'reading-test': '독해평가',
    'grade1-material': '고1부교재',
    'grade2-material': '고2부교재',
    'grade3-material': '고3부교재'
  }

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n)

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {errorMessage ? (
            <div role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {errorMessage}
            </div>
          ) : null}
          {/* 헤더 */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              장바구니로 돌아가기
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">결제하기</h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length}개 상품 • {fmt(totalAmount)}원
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">결제 준비 중 오류가 발생했습니다</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => router.push('/cart')}>장바구니로 돌아가기</Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">결제 준비 중...</h3>
                <p className="text-gray-600">잠시만 기다려주세요.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 주문 상품 목록 */}
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-lg">주문 상품</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">{categories[item.category] || item.category}</Badge>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-emerald-600">{fmt(Number(item.price) || 0)}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>상품 금액</span>
                      <span>{fmt(totalAmount)}원</span>
                    </div>
                    {pricToUse > 0 && (
                      <div className="flex justify-between items-center text-sm text-fuchsia-600">
                        <span>프릭 사용</span>
                        <span>- {fmt(pricToUse)}원</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold text-gray-900">카드 결제 금액</span>
                      <span className="text-2xl font-bold text-emerald-600">{fmt(payable)}원</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 프릭 사용 */}
              <Card className="shadow-md border-fuchsia-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🪙 프릭 사용
                    <span className="text-sm font-normal text-gray-500">보유 {fmt(pricBalance)} 프릭</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maxPric > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="number"
                        min={0}
                        max={maxPric}
                        value={pricToUse === 0 ? '' : pricToUse}
                        placeholder="0"
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(Math.trunc(Number(e.target.value) || 0), maxPric))
                          setPricToUse(v)
                        }}
                        className="w-40"
                      />
                      <span className="text-sm text-gray-500">/ 최대 {fmt(maxPric)} 프릭</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => setPricToUse(maxPric)}>전액 사용</Button>
                      {pricToUse > 0 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPricToUse(0)}>사용 안 함</Button>
                      )}
                      <span className="text-xs text-gray-400 w-full">1 프릭 = 1원. 결제 승인 시 차감됩니다.</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">사용 가능한 프릭이 없습니다.</p>
                  )}
                  {cardTooSmall && (
                    <p className="text-xs text-amber-600 mt-2">
                      카드 결제는 최소 {MIN_CARD_AMOUNT}원부터 가능합니다. 프릭 사용을 줄이거나 전액 프릭으로 결제하세요.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 결제 수단 (전액 프릭이면 카드 위젯 숨김) */}
              <div className={payable > 0 ? '' : 'hidden'}>
                <Card className="shadow-md">
                  <CardHeader><CardTitle className="text-lg">결제 수단</CardTitle></CardHeader>
                  <CardContent>
                    <div id="payment-method" className="min-h-[200px]"></div>
                  </CardContent>
                </Card>
                <Card className="shadow-md mt-6">
                  <CardContent className="pt-6">
                    <div id="agreement"></div>
                  </CardContent>
                </Card>
              </div>

              {payable === 0 && (
                <Card className="shadow-md border-fuchsia-200 bg-fuchsia-50/40">
                  <CardContent className="py-5 text-center text-fuchsia-700 font-medium">
                    프릭으로 전액 결제됩니다 — 카드 결제 없이 바로 구매 완료됩니다.
                  </CardContent>
                </Card>
              )}

              {/* 결제하기 버튼 */}
              <Button
                onClick={handlePayment}
                disabled={paying || cardTooSmall}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 text-lg font-semibold disabled:opacity-60"
              >
                {paying ? '처리 중...' : payable === 0 ? `프릭 ${fmt(pricToUse)}으로 결제하기` : `${fmt(payable)}원 결제하기`}
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  • 디지털 상품은 결제 후 즉시 다운로드가 가능합니다.<br />
                  • 결제 후 구매 내역은 마이페이지에서 확인하실 수 있습니다.<br />
                  • 환불 정책은 <a href="/refund-policy" className="text-emerald-600 underline">환불 규정</a>을 참고해주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
