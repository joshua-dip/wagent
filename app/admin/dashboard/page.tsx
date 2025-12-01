"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Download,
  Eye,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  FileText,
  CreditCard,
  Activity
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalRevenue: number
  revenueGrowth: number
  totalUsers: number
  userGrowth: number
  totalProducts: number
  activeProducts: number
  totalOrders: number
  orderGrowth: number
  totalDownloads: number
  downloadGrowth: number
}

interface RecentOrder {
  _id: string
  userEmail: string
  userName: string
  totalAmount: number
  status: string
  createdAt: string
  itemCount: number
}

interface TopProduct {
  _id: string
  title: string
  price: number
  downloadCount: number
  revenue: number
  category: string
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalUsers: 0,
    userGrowth: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    orderGrowth: 0,
    totalDownloads: 0,
    downloadGrowth: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || simpleAuth.user?.role === 'admin'

  useEffect(() => {
    // 인증 체크가 완료된 후에만 리다이렉트
    if (!isAuthenticated) return
    
    if (!isAdmin) {
      router.push('/')
      return
    }
    
    fetchDashboardData()
  }, [isAdmin, isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 통계 데이터 가져오기
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-orders'),
        fetch('/api/admin/top-products')
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats || stats)
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setRecentOrders(data.orders || [])
      }

      if (productsRes.ok) {
        const data = await productsRes.json()
        setTopProducts(data.products || [])
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 인증되지 않았으면 로딩 표시
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // 관리자가 아니면 표시하지 않음
  if (!isAdmin) {
    return null
  }

  // 데이터 로딩 중
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-500 mt-1">전체 시스템 현황을 한눈에 확인하세요</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>

        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 총 매출 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()}원
              </div>
              <div className={`flex items-center mt-2 text-sm ${
                stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(stats.revenueGrowth)}% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* 전체 사용자 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">전체 사용자</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}명
              </div>
              <div className={`flex items-center mt-2 text-sm ${
                stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.userGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(stats.userGrowth)}% 신규 가입</span>
              </div>
            </CardContent>
          </Card>

          {/* 상품 현황 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">상품 현황</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}개
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1 text-green-600" />
                <span>활성: {stats.activeProducts}개</span>
              </div>
            </CardContent>
          </Card>

          {/* 총 주문 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 주문</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalOrders.toLocaleString()}건
              </div>
              <div className={`flex items-center mt-2 text-sm ${
                stats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.orderGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(stats.orderGrowth)}% 증가</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 다운로드 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              다운로드 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDownloads.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">총 다운로드 횟수</p>
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                stats.downloadGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.downloadGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{Math.abs(stats.downloadGrowth)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 주문 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  최근 주문
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">
                    전체보기
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">주문 내역이 없습니다</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.userName}</p>
                        <p className="text-sm text-gray-500">{order.userEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {order.itemCount}개 상품
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {order.totalAmount.toLocaleString()}원
                        </p>
                        <Badge className={`mt-1 ${
                          order.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 인기 상품 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  인기 상품 TOP 5
                </CardTitle>
                <Link href="/admin/products">
                  <Button variant="ghost" size="sm">
                    전체보기
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">상품이 없습니다</p>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            <Download className="h-3 w-3 inline mr-1" />
                            {product.downloadCount}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {product.price.toLocaleString()}원
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                          매출: {product.revenue.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/upload">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>자료 업로드</span>
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span>상품 관리</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>사용자 관리</span>
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span>통계 분석</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
