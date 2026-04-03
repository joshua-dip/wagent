"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Home, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [confirming, setConfirming] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')
      const productId = searchParams.get('productId')
      const isCart = searchParams.get('isCart') === 'true'

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.')
        setConfirming(false)
        return
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
            productId,
            isCart,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setPurchaseInfo(data.purchase || data.purchases)
          
          // 장바구니 결제인 경우 장바구니 비우기
          if (isCart) {
            clearCart()
          }
        } else {
          setError(data.error || '결제 승인에 실패했습니다.')
        }
      } catch (error) {
        console.error('결제 승인 오류:', error)
        setError('결제 승인 중 오류가 발생했습니다.')
      } finally {
        setConfirming(false)
      }
    }

    confirmPayment()
  }, [searchParams, clearCart])

  if (confirming) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 처리 중...</h2>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <Card className="w-full max-w-md border-red-200">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/products')}
                >
                  상품 목록으로
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <Card className="w-full max-w-2xl border-green-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              결제가 완료되었습니다! 🎉
            </CardTitle>
            <p className="text-gray-600 mt-2">
              구매해주셔서 감사합니다.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 구매 정보 */}
            {purchaseInfo && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">구매 내역</h3>
                
                {Array.isArray(purchaseInfo) ? (
                  // 장바구니 결제인 경우 (여러 상품)
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {purchaseInfo.map((purchase: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="font-medium text-gray-900">{purchase.productTitle}</span>
                          <span className="text-emerald-600 font-semibold">
                            {new Intl.NumberFormat('ko-KR').format(purchase.amount)}원
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          {new Intl.NumberFormat('ko-KR').format(
                            purchaseInfo.reduce((sum: number, p: any) => sum + p.amount, 0)
                          )}원
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">구매 상품 수</p>
                        <p className="font-medium text-gray-900">{purchaseInfo.length}개</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">구매 일시</p>
                        <p className="font-medium text-gray-900">
                          {new Date(purchaseInfo[0].purchaseDate).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 단일 상품 결제인 경우
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">상품명</p>
                      <p className="font-medium text-gray-900">{purchaseInfo.productTitle}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">결제 금액</p>
                      <p className="font-bold text-emerald-600 text-lg">
                        {new Intl.NumberFormat('ko-KR').format(purchaseInfo.amount)}원
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">구매 일시</p>
                      <p className="font-medium text-gray-900">
                        {new Date(purchaseInfo.purchaseDate).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">주문 번호</p>
                      <p className="font-mono text-xs text-gray-600">{purchaseInfo._id}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 다음 단계 안내 */}
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">다음 단계</h3>
              <ul className="space-y-2 text-emerald-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>구매한 자료는 마이페이지에서 언제든지 다운로드할 수 있습니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>구매 내역은 이메일로도 발송됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>문의사항이 있으시면 고객센터로 연락 주세요.</span>
                </li>
              </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {purchaseInfo && !Array.isArray(purchaseInfo) && (
                <Button 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  onClick={() => router.push(`/products/${purchaseInfo.productId}`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  자료 다운로드하기
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/user-dashboard')}
              >
                구매 내역 보기
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로딩 중...</h2>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

