"use client"

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Home, RefreshCw } from 'lucide-react'

function PaymentFailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const code = searchParams.get('code')
  const message = searchParams.get('message')

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              결제 실패
            </CardTitle>
            <p className="text-gray-600 mt-2">
              결제 처리 중 문제가 발생했습니다.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 오류 정보 */}
            {(code || message) && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                {code && (
                  <div className="mb-2">
                    <p className="text-sm text-red-600 font-medium">오류 코드</p>
                    <p className="text-red-900 font-mono text-sm">{code}</p>
                  </div>
                )}
                {message && (
                  <div>
                    <p className="text-sm text-red-600 font-medium">오류 메시지</p>
                    <p className="text-red-900">{decodeURIComponent(message)}</p>
                  </div>
                )}
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">결제 실패 원인</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 카드 한도 초과</li>
                <li>• 카드 정보 오류</li>
                <li>• 결제 취소</li>
                <li>• 네트워크 연결 문제</li>
              </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => router.back()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도하기
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/products')}
                >
                  상품 목록으로
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>
            </div>

            {/* 고객센터 안내 */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>문제가 계속되면 고객센터로 문의해주세요.</p>
              <p className="font-medium text-gray-700 mt-1">
                📞 010-7927-0806 | 📧 payperic@naver.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-gray-600">로딩 중...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}

