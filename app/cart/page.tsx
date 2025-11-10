"use client"

import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Home,
  FileText,
  AlertCircle
} from 'lucide-react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const { cartItems, removeFromCart, clearCart } = useCart()

  // 인증 확인
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === 'loading'

  const handleClearCart = () => {
    if (confirm('장바구니를 비우시겠습니까?')) {
      clearCart()
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0)
  }

  const calculateDiscount = () => {
    return cartItems.reduce((sum, item) => {
      const discount = (item.originalPrice || item.price) - item.price
      return sum + discount
    }, 0)
  }

  const handleCheckout = () => {
    // 인증 로딩 중
    if (isAuthLoading) {
      alert('로그인 상태를 확인하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // 디버깅 로그
    console.log('인증 상태:', {
      simpleAuthLoading: simpleAuth.isLoading,
      simpleAuthAuthenticated: simpleAuth.isAuthenticated,
      simpleAuthUser: simpleAuth.user,
      sessionStatus: status,
      sessionExists: !!session,
      sessionUser: session?.user,
      finalAuthenticated: isAuthenticated,
      finalUser: currentUser
    })

    if (!isAuthenticated) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/auth/simple-signin')
      }
      return
    }

    // 결제 페이지로 이동
    router.push('/cart/checkout')
  }

  const handleRemoveItem = (productId: string) => {
    if (confirm('이 상품을 장바구니에서 제거하시겠습니까?')) {
      removeFromCart(productId)
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
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
                  <p className="text-gray-600 mt-1">
                    {cartItems.length}개 상품
                  </p>
                </div>
              </div>
              
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  전체 삭제
                </Button>
              )}
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* 빈 장바구니 */
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  장바구니가 비어있습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  마음에 드는 상품을 장바구니에 담아보세요!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    홈으로
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => router.push('/products')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    상품 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* 장바구니 아이템 */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 상품 목록 */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.productId} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* 썸네일 */}
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={96}
                              height={96}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <FileText className="w-10 h-10 text-gray-400" />
                          )}
                        </div>

                        {/* 상품 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {item.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {categories[item.category] || item.category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* 디지털 상품 안내 */}
                            <div className="text-sm text-gray-500">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                디지털 상품 • 1회 구매
                              </span>
                            </div>

                            {/* 가격 */}
                            <div className="text-right">
                              {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-sm text-gray-500 line-through">
                                  {new Intl.NumberFormat('ko-KR').format(item.originalPrice)}원
                                </p>
                              )}
                              <p className="text-lg font-bold text-blue-600">
                                {new Intl.NumberFormat('ko-KR').format(item.price)}원
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 주문 요약 */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-20">
                  <CardHeader>
                    <CardTitle className="text-xl">주문 요약</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>상품 금액</span>
                        <span>{new Intl.NumberFormat('ko-KR').format(calculateTotal() + calculateDiscount())}원</span>
                      </div>
                      
                      {calculateDiscount() > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>할인</span>
                          <span>-{new Intl.NumberFormat('ko-KR').format(calculateDiscount())}원</span>
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">총 결제 금액</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('ko-KR').format(calculateTotal())}원
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isAuthenticated && !isAuthLoading && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            결제를 진행하려면 로그인이 필요합니다.
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
                      onClick={handleCheckout}
                      disabled={isAuthLoading}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isAuthLoading ? '로그인 확인 중...' : `${cartItems.length}개 상품 구매하기`}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => router.push('/products')}
                        className="text-gray-600"
                      >
                        쇼핑 계속하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

