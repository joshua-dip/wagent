"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { Loader2, ShoppingCart, AlertCircle, ChevronLeft } from 'lucide-react'

declare global {
  interface Window {
    PaymentWidget: any
  }
}

export default function CartCheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const { cartItems, clearCart } = useCart()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string>('')
  const [authChecked, setAuthChecked] = useState(false)
  
  const paymentWidgetRef = useRef<any>(null)
  const paymentMethodsWidgetRef = useRef<any>(null)
  
  // 인증 확인
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === 'loading'

  // 총 금액 계산
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0)
  }

  const totalAmount = calculateTotal()

  // 인증 상태 확인
  useEffect(() => {
    // NextAuth 세션 또는 SimpleAuth가 로딩 중이면 대기
    if (isAuthLoading) {
      console.log('인증 로딩 중...', { 
        simpleAuthLoading: simpleAuth.isLoading, 
        sessionStatus: status 
      })
      return
    }

    // 인증 확인 완료
    console.log('인증 확인 완료:', {
      simpleAuth: simpleAuth.isAuthenticated,
      session: !!session,
      user: currentUser,
      isAuthenticated
    })
    
    setAuthChecked(true)

    // 인증 체크
    if (!isAuthenticated) {
      console.log('인증 실패 - 로그인 페이지로 리다이렉트')
      alert('로그인이 필요합니다.')
      router.push('/auth/simple-signin')
      return
    }

    // 장바구니가 비어있는지 체크
    if (cartItems.length === 0) {
      console.log('장바구니 비어있음')
      alert('장바구니가 비어있습니다.')
      router.push('/cart')
      return
    }
  }, [isAuthLoading, isAuthenticated, cartItems.length, router, simpleAuth.isLoading, status, simpleAuth.isAuthenticated, session, currentUser])

  // Payment Widget 초기화
  useEffect(() => {
    // 인증이 확인되지 않았거나, 인증되지 않았으면 중단
    if (!authChecked || !isAuthenticated) {
      return
    }

    // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
    if (cartItems.length === 0) {
      console.log('장바구니 비어있음 - 리다이렉트')
      alert('장바구니가 비어있습니다.')
      router.push('/cart')
      return
    }

    // orderId 생성 및 주문 정보 저장
    const initOrder = async () => {
      // 더 고유한 orderId 생성 (타임스탬프 + 랜덤 + 추가 랜덤 + 마이크로초)
      const timestamp = Date.now()
      const microseconds = performance.now().toString().replace('.', '')
      const random1 = Math.random().toString(36).substr(2, 9)
      const random2 = Math.random().toString(36).substr(2, 5)
      const random3 = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const newOrderId = `CART_${timestamp}_${microseconds.slice(-6)}_${random1}_${random2}_${random3}`
      
      console.log('새 주문 ID 생성:', newOrderId)
      setOrderId(newOrderId)

      // 주문 정보를 서버에 저장
      try {
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: newOrderId,
            cartItems: cartItems,
            totalAmount: totalAmount
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          console.error('주문 정보 저장 실패:', data)
          if (data.error?.includes('duplicate') || data.error?.includes('중복')) {
            // 중복 orderId인 경우 페이지 새로고침
            console.log('중복 orderId 감지 - 페이지 새로고침')
            window.location.reload()
          }
        } else {
          console.log('주문 정보 저장 성공:', data)
        }
      } catch (error) {
        console.error('주문 정보 저장 오류:', error)
      }

      // Payment Widget 스크립트 로드
      const script = document.createElement('script')
      script.src = 'https://js.tosspayments.com/v1/payment-widget'
      script.async = true
      
      script.onload = () => {
        initializePaymentWidget()
      }
      
      script.onerror = () => {
        setError('결제 모듈을 불러오는데 실패했습니다.')
        setIsLoading(false)
      }
      
      document.body.appendChild(script)

      return () => {
        // 정리
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }

    initOrder()
  }, [authChecked, isAuthenticated, cartItems, totalAmount])

  const initializePaymentWidget = async () => {
    try {
      if (!window.PaymentWidget) {
        throw new Error('PaymentWidget을 불러올 수 없습니다.')
      }

      // DOM 요소가 준비될 때까지 대기
      const waitForElement = (selector: string, timeout = 5000) => {
        return new Promise<Element>((resolve, reject) => {
          const element = document.querySelector(selector)
          if (element) {
            resolve(element)
            return
          }

          const observer = new MutationObserver(() => {
            const element = document.querySelector(selector)
            if (element) {
              observer.disconnect()
              resolve(element)
            }
          })

          observer.observe(document.body, {
            childList: true,
            subtree: true
          })

          setTimeout(() => {
            observer.disconnect()
            reject(new Error(`${selector} 요소를 찾을 수 없습니다.`))
          }, timeout)
        })
      }

      // 로딩 화면 숨기기
      setIsLoading(false)

      // DOM 요소가 렌더링될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      // 결제 위젯을 렌더링할 DOM 요소가 있는지 확인
      await waitForElement('#payment-method')
      await waitForElement('#agreement')

      // 클라이언트 키 (결제위젯 연동 키)
      const widgetClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5'
      
      // customerKey: 구매자의 고유 식별자 (이메일 기반)
      const customerKey = currentUser?.email 
        ? btoa(currentUser.email).substring(0, 50) // base64 인코딩 후 최대 50자
        : `GUEST_${Date.now()}`

      // Payment Widget 초기화
      const paymentWidget = window.PaymentWidget(widgetClientKey, customerKey)
      paymentWidgetRef.current = paymentWidget

      // 결제 수단 렌더링
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        '#payment-method',
        { value: totalAmount },
        { variantKey: 'DEFAULT' }
      )
      paymentMethodsWidgetRef.current = paymentMethodsWidget

      // 이용약관 렌더링
      await paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' })

    } catch (err) {
      console.error('Payment Widget 초기화 오류:', err)
      setError(err instanceof Error ? err.message : '결제 위젯 초기화에 실패했습니다.')
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) {
      alert('결제 위젯이 초기화되지 않았습니다.')
      return
    }

    try {
      // 주문명 생성 (첫 번째 상품명 + 외 N건)
      const orderName = cartItems.length === 1 
        ? cartItems[0].title
        : `${cartItems[0].title} 외 ${cartItems.length - 1}건`

      // 결제 요청
      await paymentWidgetRef.current.requestPayment({
        orderId: orderId,
        orderName: orderName,
        successUrl: `${window.location.origin}/payment/success?isCart=true`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: currentUser?.email || 'guest@example.com',
        customerName: currentUser?.name || '고객',
        customerMobilePhone: currentUser?.phone || '01000000000',
      })
    } catch (err) {
      console.error('결제 요청 오류:', err)
      alert('결제 요청 중 오류가 발생했습니다.')
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              장바구니로 돌아가기
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">결제하기</h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length}개 상품 • {new Intl.NumberFormat('ko-KR').format(totalAmount)}원
                </p>
              </div>
            </div>
          </div>

          {error ? (
            /* 오류 화면 */
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  결제 준비 중 오류가 발생했습니다
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => router.push('/cart')}>
                  장바구니로 돌아가기
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            /* 로딩 화면 */
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  결제 준비 중...
                </h3>
                <p className="text-gray-600">잠시만 기다려주세요.</p>
              </CardContent>
            </Card>
          ) : (
            /* 결제 화면 */
            <div className="space-y-6">
              {/* 주문 상품 목록 */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">주문 상품</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {categories[item.category] || item.category}
                          </Badge>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-blue-600">
                            {new Intl.NumberFormat('ko-KR').format(item.price)}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('ko-KR').format(totalAmount)}원
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 결제 수단 선택 */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">결제 수단</CardTitle>
                </CardHeader>
                <CardContent>
                  <div id="payment-method" className="min-h-[200px]"></div>
                </CardContent>
              </Card>

              {/* 이용약관 */}
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div id="agreement"></div>
                </CardContent>
              </Card>

              {/* 결제하기 버튼 */}
              <Button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
              >
                {new Intl.NumberFormat('ko-KR').format(totalAmount)}원 결제하기
              </Button>

              {/* 안내 사항 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  • 디지털 상품은 결제 후 즉시 다운로드가 가능합니다.<br />
                  • 결제 후 구매 내역은 마이페이지에서 확인하실 수 있습니다.<br />
                  • 환불 정책은 <a href="/refund-policy" className="text-blue-600 underline">환불 규정</a>을 참고해주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

