"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { 
  User,
  Settings,
  Upload,
  Download,
  BarChart3,
  Gift,
  FileText,
  Users,
  ShoppingBag,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function SimpleDashboard() {
  const { user, loading, authenticated, logout } = useSimpleAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth/simple-signin')
    }
  }, [loading, authenticated, router])

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

  if (!authenticated) {
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
              <h1 className="text-xl font-bold text-gray-900">WAgent 대시보드</h1>
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
              WAgent 관리자 대시보드에 오신 것을 환영합니다. (간단한 인증 버전)
            </p>
          </div>

          {/* 빠른 액세스 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 상품 업로드 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  상품 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">새로운 PDF 자료를 업로드하세요</p>
                <Link href="/admin/upload">
                  <Button className="w-full">업로드하기</Button>
                </Link>
              </CardContent>
            </Card>

            {/* 무료 자료 관리 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-blue-600" />
                  </div>
                  무료 자료
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">무료 자료 목록을 확인하세요</p>
                <Link href="/products/free">
                  <Button variant="outline" className="w-full">보기</Button>
                </Link>
              </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  시스템 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">시스템 헬스체크를 확인하세요</p>
                <Link href="/api/health" target="_blank">
                  <Button variant="outline" className="w-full">확인하기</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <ShoppingBag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">총 상품</p>
            </Card>

            <Card className="text-center p-6">
              <Download className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">245</h3>
              <p className="text-gray-600">총 다운로드</p>
            </Card>

            <Card className="text-center p-6">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">89</h3>
              <p className="text-gray-600">활성 사용자</p>
            </Card>

            <Card className="text-center p-6">
              <FileText className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">7</h3>
              <p className="text-gray-600">무료 자료</p>
            </Card>
          </div>

          {/* 디버깅 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 디버깅 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>인증 방식:</strong> 간단한 JWT 기반 인증 (NextAuth.js 우회)
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>사용자 정보:</strong> {JSON.stringify(user, null, 2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>목적:</strong> 500 오류 디버깅 및 기본 기능 테스트
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}