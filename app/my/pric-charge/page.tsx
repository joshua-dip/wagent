"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useSession } from 'next-auth/react'
import { Loader2, Coins, ChevronLeft, AlertCircle } from 'lucide-react'
import { pricChargePayable, pricChargeDiscountRate } from '@/lib/pric-charge'

declare global {
  interface Window {
    PaymentWidget: any
  }
}

const PRESETS = [5000, 10000, 30000, 50000, 100000]
const MIN = 1000
const MAX = 1_000_000

export default function PricChargePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [paying, setPaying] = useState(false)
  const [pricBalance, setPricBalance] = useState(0)
  const [amount, setAmount] = useState(10000)

  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === 'loading'

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n)
  const discountRate = pricChargeDiscountRate(amount)
  const payable = pricChargePayable(amount)

  // 인증
  useEffect(() => {
    if (isAuthLoading) return
    setAuthChecked(true)
    if (!isAuthenticated) {
      setErrorMessage('충전하려면 로그인이 필요합니다. 로그인 페이지로 이동합니다.')
      const id = window.setTimeout(() => router.push('/auth/simple-signin'), 300)
      return () => clearTimeout(id)
    }
  }, [isAuthLoading, isAuthenticated, router])

  // 잔액
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return
    fetch('/api/pric/balance', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (typeof d?.pric === 'number') setPricBalance(d.pric) })
      .catch(() => {})
  }, [authChecked, isAuthenticated])

  // Toss 위젯
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment-widget'
    script.async = true
    script.onload = () => initWidget()
    script.onerror = () => { setError('결제 모듈을 불러오는데 실패했습니다.'); setIsLoading(false) }
    document.body.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated])

  // 결제 금액(할인 적용) 변경 → 위젯 동기화
  useEffect(() => {
    if (paymentMethodsWidgetRef.current && payable > 0) {
      try { paymentMethodsWidgetRef.current.updateAmount(payable) } catch {}
    }
  }, [payable])

  const initWidget = async () => {
    try {
      if (!window.PaymentWidget) throw new Error('PaymentWidget을 불러올 수 없습니다.')
      const wait = (sel: string, ms = 5000) =>
        new Promise<Element>((resolve, reject) => {
          const el = document.querySelector(sel)
          if (el) { resolve(el); return }
          const obs = new MutationObserver(() => {
            const f = document.querySelector(sel)
            if (f) { obs.disconnect(); resolve(f) }
          })
          obs.observe(document.body, { childList: true, subtree: true })
          setTimeout(() => { obs.disconnect(); reject(new Error(`${sel} 없음`)) }, ms)
        })

      setIsLoading(false)
      await new Promise(r => setTimeout(r, 100))
      await wait('#payment-method')
      await wait('#agreement')

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5'
      const customerKey = currentUser?.email ? btoa(currentUser.email).substring(0, 50) : `GUEST_${Date.now()}`
      const pw = window.PaymentWidget(clientKey, customerKey)
      paymentWidgetRef.current = pw
      paymentMethodsWidgetRef.current = pw.renderPaymentMethods('#payment-method', { value: payable }, { variantKey: 'DEFAULT' })
      await pw.renderAgreement('#agreement', { variantKey: 'AGREEMENT' })
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 위젯 초기화 실패')
      setIsLoading(false)
    }
  }

  const setAmountClamped = (v: number) => setAmount(Math.max(0, Math.min(Math.trunc(v || 0), MAX)))

  const handleCharge = async () => {
    setErrorMessage('')
    if (amount < MIN) { setErrorMessage(`최소 ${fmt(MIN)} 프릭부터 충전할 수 있습니다.`); return }
    if (!paymentWidgetRef.current) { setErrorMessage('결제 위젯이 초기화되지 않았습니다.'); return }

    const orderId = `PRIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setPaying(true)
    try {
      const res = await fetch('/api/pric/charge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, amount }),
      })
      const data = await res.json()
      if (!res.ok) { setPaying(false); setErrorMessage(data.error || '충전 주문 생성 실패'); return }
    } catch {
      setPaying(false); setErrorMessage('충전 주문 생성 중 오류'); return
    }

    try {
      try { paymentMethodsWidgetRef.current?.updateAmount(payable) } catch {}
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: `프릭 ${fmt(amount)} 충전`,
        successUrl: `${window.location.origin}/payment/success?pricCharge=1`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: currentUser?.email || 'guest@example.com',
        customerName: currentUser?.name || '고객',
        customerMobilePhone: (currentUser as { phone?: string })?.phone || '01000000000',
      })
    } catch {
      setPaying(false); setErrorMessage('결제 요청 중 오류가 발생했습니다.')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {errorMessage && (
            <div role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{errorMessage}</div>
          )}

          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />뒤로
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">프릭 충전</h1>
              <p className="text-gray-600 mt-1 text-sm">보유 프릭 <span className="font-bold text-fuchsia-700">{fmt(pricBalance)}</span> · 많이 충전할수록 최대 15% 할인</p>
            </div>
          </div>

          {error ? (
            <Card className="shadow-lg"><CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-500" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">결제 준비 중 오류</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/my/purchases')}>마이페이지로</Button>
            </CardContent></Card>
          ) : isLoading ? (
            <Card className="shadow-lg"><CardContent className="text-center py-16">
              <Loader2 className="w-16 h-16 text-fuchsia-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">결제 준비 중...</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-6">
              {/* 금액 선택 */}
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-lg">충전 금액</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                    {PRESETS.map((p) => {
                      const active = amount === p
                      const r = pricChargeDiscountRate(p)
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setAmount(p)}
                          className={`flex flex-col items-center leading-tight py-2.5 px-2 rounded-lg text-sm font-semibold border transition-colors ${
                            active ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-fuchsia-300'
                          }`}
                        >
                          <span>{fmt(p)}</span>
                          {r > 0 && (
                            <span className={`text-[10px] font-bold ${active ? 'text-fuchsia-100' : 'text-rose-600'}`}>{Math.round(r * 100)}% 할인</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={MIN}
                      max={MAX}
                      step={1000}
                      value={amount === 0 ? '' : amount}
                      onChange={(e) => setAmountClamped(Number(e.target.value))}
                      className="w-44"
                    />
                    <span className="text-sm text-slate-500">프릭 직접 입력 (최소 {fmt(MIN)})</span>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-1.5">
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>충전 프릭</span>
                      <span>{fmt(amount)} 프릭</span>
                    </div>
                    {discountRate > 0 && (
                      <div className="flex justify-between items-center text-sm text-rose-600 font-medium">
                        <span>{Math.round(discountRate * 100)}% 할인</span>
                        <span>- {fmt(amount - payable)}원</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-semibold text-gray-900">결제 금액</span>
                      <span className="text-2xl font-bold text-fuchsia-700">{fmt(payable)}원</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 결제 수단 */}
              <Card className="shadow-md">
                <CardHeader><CardTitle className="text-lg">결제 수단</CardTitle></CardHeader>
                <CardContent><div id="payment-method" className="min-h-[200px]" /></CardContent>
              </Card>
              <Card className="shadow-md"><CardContent className="pt-6"><div id="agreement" /></CardContent></Card>

              <Button
                onClick={handleCharge}
                disabled={paying || amount < MIN}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 py-6 text-lg font-semibold disabled:opacity-60"
              >
                {paying ? '처리 중...' : `${fmt(payable)}원 결제하고 ${fmt(amount)} 프릭 충전`}
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  • 많이 충전할수록 할인: 1만+ 5% · 3만+ 7% · 5만+ 10% · 10만+ 15%<br />
                  • 충전한 프릭은 자료 구매 시 결제 금액에 사용할 수 있습니다.<br />
                  • 결제 완료 즉시 잔액에 반영됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
