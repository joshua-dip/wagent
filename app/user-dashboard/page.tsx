"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { 
  User,
  Download,
  FileText,
  Gift,
  Heart,
  ShoppingCart,
  Star,
  CreditCard,
  Loader2,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function UserDashboard() {
  const { user, loading, authenticated, logout } = useSimpleAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth/simple-signin')
    } else if (user?.role === 'admin') {
      // 관리자는 관리자 대시보드로 리다이렉트
      router.push('/simple-dashboard')
    }
  }, [loading, authenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || user?.role !== 'user') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">WAgent</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* 환영 메시지 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">
              안녕하세요, {user?.name}님! 👋
            </h2>
            <p className="text-blue-100">
              WAgent에서 다양한 디지털 자료를 만나보세요. 무료 자료부터 프리미엄 콘텐츠까지!
            </p>
          </div>

          {/* 빠른 액세스 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 무료 자료 다운로드 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  무료 자료
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">프리미엄 품질의 무료 디지털 자료</p>
                <Link href="/products/free">
                  <Button className="w-full bg-green-500 hover:bg-green-600">
                    <Download className="w-4 h-4 mr-2" />
                    무료 다운로드
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 전체 상품 보기 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  전체 상품
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">모든 디지털 자료 둘러보기</p>
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    상품 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 내 구매 내역 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  구매 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">구매한 자료 확인 및 다운로드</p>
                <Link href="/my/purchases">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    내역 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* 사용자 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Download className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">무료 다운로드</p>
            </Card>

            <Card className="text-center p-6">
              <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">구매한 상품</p>
            </Card>

            <Card className="text-center p-6">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">위시리스트</p>
            </Card>

            <Card className="text-center p-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">평가한 상품</p>
            </Card>
          </div>

          {/* 최근 무료 자료 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-500" />
                최근 추가된 무료 자료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>무료 자료가 업데이트되면 여기에 표시됩니다.</p>
                <Link href="/products/free">
                  <Button variant="outline" className="mt-4">
                    무료 자료 보러가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 사용자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>👤 계정 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">이메일:</span>
                    <span className="ml-2">{user?.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">이름:</span>
                    <span className="ml-2">{user?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">역할:</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      일반 사용자
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">가입일:</span>
                    <span className="ml-2">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}