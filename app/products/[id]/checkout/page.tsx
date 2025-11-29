"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useSession } from 'next-auth/react'
import { Loader2, ShoppingCart, AlertCircle, ChevronLeft, FileText } from 'lucide-react'

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

export default function ProductCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  
  const [product, setProduct] = useState<Product | null>(null)
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

  // 상품 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) {
          throw new Error('상품 정보를 불러올 수 없습니다.')
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        console.error('상품 로딩 오류:', err)
        setError(err instanceof Error ? err.message : '상품 정보를 불러올 수 없습니다.')
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // 인증 상태 확인
  useEffect(() => {
    if (isAuthLoading) {
      console.log('인증 로딩 중...', { 
        simpleAuthLoading: simpleAuth.isLoading, 
        sessionStatus: status 
      })
      return
    }

    console.log('인증 확인 완료:', {
      simpleAuth: simpleAuth.isAuthenticated,
      session: !!session,
      user: currentUser,
      isAuthenticated
    })
    
    setAuthChecked(true)

    if (!isAuthenticated) {
      console.log('인증 실패 - 로그인 페이지로 리다이렉트')
      alert('로그인이 필요합니다.')
      router.push('/auth/simple-signin')
      return
    }
  }, [isAuthLoading, isAuthenticated, router, simpleAuth.isLoading, status, simpleAuth.isAuthenticated, session, currentUser])

  // Payment Widget 초기화
  useEffect(() => {
    if (!authChecked || !isAuthenticated || !product) {
      return
    }

    const initOrder = async () => {
      // 고유한 orderId 생성
      const timestamp = Date.now()
      const random1 = Math.random().toString(36).substr(2, 9)
      const random2 = Math.random().toString(36).substr(2, 5)
      const newOrderId = `PRODUCT_${timestamp}_${random1}_${random2}`
      
      console.log('새 주문 ID 생성:', newOrderId)
      setOrderId(newOrderId)

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
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }

    initOrder()
  }, [authChecked, isAuthenticated, product])

  const initializePaymentWidget = async () => {
    try {
      if (!window.PaymentWidget) {
        throw new Error('PaymentWidget을 불러올 수 없습니다.')
      }

      if (!product) {
        throw new Error('상품 정보가 없습니다.')
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

      const widgetClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_oEjb0gm23PYg09qN6pQjVpGwBJn5'
      
      const customerKey = currentUser?.email 
        ? btoa(currentUser.email).substring(0, 50)
        : `GUEST_${Date.now()}`

      const paymentWidget = window.PaymentWidget(widgetClientKey, customerKey)
      paymentWidgetRef.current = paymentWidget

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        '#payment-method',
        { value: product.price },
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

  const handlePayment = async () => {
    if (!paymentWidgetRef.current || !product) {
      alert('결제 위젯이 초기화되지 않았습니다.')
      return
    }

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: orderId,
        orderName: product.title,
        successUrl: `${window.location.origin}/payment/success?productId=${productId}`,
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

  if (error && !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  오류가 발생했습니다
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => router.push('/products')}>
                  상품 목록으로 돌아가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
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
              상품으로 돌아가기
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">결제하기</h1>
                {product && (
                  <p className="text-gray-600 mt-1">
                    {product.title} • {new Intl.NumberFormat('ko-KR').format(product.price)}원
                  </p>
                )}
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
                <Button onClick={() => router.back()}>
                  상품으로 돌아가기
                </Button>
              </CardContent>
            </Card>
          ) : isLoading || !product ? (
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
              {/* 상품 정보 */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">주문 상품</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{product.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {categories[product.category] || product.category}
                      </Badge>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('ko-KR').format(product.originalPrice)}원
                        </p>
                      )}
                      <p className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('ko-KR').format(product.price)}원
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('ko-KR').format(product.price)}원
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
                {new Intl.NumberFormat('ko-KR').format(product.price)}원 결제하기
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

