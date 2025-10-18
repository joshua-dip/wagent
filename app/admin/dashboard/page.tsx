"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import { 
  Upload,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Download
} from 'lucide-react'

interface AdminStats {
  totalProducts: number
  totalSales: number
  totalRevenue: number
  totalUsers: number
  recentProducts: any[]
  recentPurchases: any[]
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  // 로그인하지 않은 경우
  if (!session) {
    router.push('/auth/signin')
    return null
  }

  // Admin 컬렉션 기반 권한 확인으로 변경 예정
  if (session.user?.email !== 'wnsrb2898@naver.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">관리자 전용</h2>
            <p className="text-gray-600 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
            <Button onClick={() => router.push('/')} variant="outline">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    // 임시 데이터 (실제로는 API에서 가져와야 함)
    setStats({
      totalProducts: 12,
      totalSales: 45,
      totalRevenue: 1234500,
      totalUsers: 89,
      recentProducts: [],
      recentPurchases: []
    })
    setLoading(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">관리자 대시보드를 불러오는 중...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-3 sm:-m-6 min-h-full py-8 px-6 sm:px-8 lg:px-12">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                관리자 대시보드 🛠️
              </h1>
              <p className="text-gray-600">PAYPERIC 디지털 마켓플레이스 관리</p>
            </div>
            <Link href="/admin/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                새 상품 업로드
              </Button>
            </Link>
          </div>
        </div>

        {/* 빠른 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 상품 수</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 판매 건수</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}원</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">총 사용자 수</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 주요 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 상품 업로드 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">상품 업로드</h3>
                <p className="text-sm text-gray-600 mb-4">새로운 PDF 상품을 업로드하고 판매를 시작하세요</p>
                <Link href="/admin/upload">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    업로드하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 상품 관리 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">상품 관리</h3>
                <p className="text-sm text-gray-600 mb-4">업로드된 상품을 수정, 삭제, 관리하세요</p>
                <Link href="/admin/products">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    관리하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 판매 분석 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">판매 분석</h3>
                <p className="text-sm text-gray-600 mb-4">매출 통계와 판매 데이터를 분석하세요</p>
                <Link href="/admin/analytics">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    분석보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 구매 관리 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">구매 관리</h3>
                <p className="text-sm text-gray-600 mb-4">모든 구매 내역과 다운로드를 관리하세요</p>
                <Link href="/admin/purchases">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    관리하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 사용자 관리 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">사용자 관리</h3>
                <p className="text-sm text-gray-600 mb-4">가입된 사용자를 조회하고 관리하세요</p>
                <Link href="/admin/users">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    관리하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 저장소 설정 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">저장소 설정</h3>
                <p className="text-sm text-gray-600 mb-4">파일 저장소 (로컬 ↔ AWS S3) 관리</p>
                <Link href="/admin/storage-settings">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    설정하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 사이트 설정 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">사이트 설정</h3>
                <p className="text-sm text-gray-600 mb-4">사이트 전반적인 설정을 관리하세요</p>
                <Link href="/admin/settings">
                  <Button className="w-full bg-gray-600 hover:bg-gray-700">
                    설정하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 업로드된 상품 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                최근 업로드된 상품
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>아직 업로드된 상품이 없습니다</p>
                <Link href="/admin/upload">
                  <Button variant="outline" className="mt-3">
                    첫 상품 업로드하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 최근 구매 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                최근 구매 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>아직 구매 내역이 없습니다</p>
                <p className="text-sm text-gray-400">상품이 판매되면 여기에 표시됩니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}