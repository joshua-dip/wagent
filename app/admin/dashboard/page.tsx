"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  Download,
  Star,
  ArrowUpRight,
  RefreshCw,
  FileText,
  CreditCard,
  Activity,
  Loader2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "완료",
  PENDING: "대기",
  CANCELED: "취소",
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, revenueGrowth: 0,
    totalUsers: 0, userGrowth: 0,
    totalProducts: 0, activeProducts: 0,
    totalOrders: 0, orderGrowth: 0,
    totalDownloads: 0, downloadGrowth: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || simpleAuth.user?.role === "admin"

  useEffect(() => {
    if (simpleAuth.isLoading || status === "loading") return
    if (!isAuthenticated) { router.push("/auth/admin-signin?next=/admin/dashboard"); return }
    if (!isAdmin) { router.push("/"); return }
    fetchDashboardData()
  }, [isAdmin, isAuthenticated, router, simpleAuth.isLoading, status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/recent-orders"),
        fetch("/api/admin/top-products"),
      ])
      if (statsRes.ok) { const d = await statsRes.json(); setStats(d.stats || stats) }
      if (ordersRes.ok) { const d = await ordersRes.json(); setRecentOrders(d.orders || []) }
      if (productsRes.ok) { const d = await productsRes.json(); setTopProducts(d.products || []) }
    } catch (error) {
      console.error("대시보드 데이터 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  if (simpleAuth.isLoading || status === "loading" || !isAuthenticated) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">인증 확인 중…</p>
        </div>
      </AdminLayout>
    )
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">데이터를 불러오는 중…</p>
        </div>
      </AdminLayout>
    )
  }

  const kpis = [
    {
      label: "총 매출",
      value: `${stats.totalRevenue.toLocaleString()}원`,
      growth: stats.revenueGrowth,
      growthLabel: "전월 대비",
      icon: CreditCard,
      color: "from-emerald-400 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "전체 사용자",
      value: `${stats.totalUsers.toLocaleString()}명`,
      growth: stats.userGrowth,
      growthLabel: "신규 가입",
      icon: Users,
      color: "from-teal-400 to-cyan-500",
      bgLight: "bg-teal-50",
      textColor: "text-teal-700",
    },
    {
      label: "등록 상품",
      value: `${stats.totalProducts}개`,
      sub: `활성 ${stats.activeProducts}개`,
      icon: Package,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "총 주문",
      value: `${stats.totalOrders.toLocaleString()}건`,
      growth: stats.orderGrowth,
      growthLabel: "증가",
      icon: ShoppingCart,
      color: "from-teal-500 to-emerald-600",
      bgLight: "bg-teal-50",
      textColor: "text-teal-700",
    },
  ]

  const quickActions = [
    { href: "/admin/upload", icon: Upload, label: "자료 업로드" },
    { href: "/admin/products", icon: Package, label: "상품 관리" },
    { href: "/admin/users", icon: Users, label: "사용자 관리" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">관리자 대시보드</h1>
            <p className="text-sm text-slate-500 mt-0.5">전체 현황을 한눈에 확인하세요</p>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            새로고침
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-medium text-slate-500">{kpi.label}</span>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white", kpi.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 mb-1">{kpi.value}</p>
                {kpi.growth !== undefined ? (
                  <div className={cn("flex items-center gap-1 text-xs", kpi.growth >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {kpi.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(kpi.growth)}% {kpi.growthLabel}
                  </div>
                ) : kpi.sub ? (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    {kpi.sub}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Downloads */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">총 다운로드</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stats.totalDownloads.toLocaleString()}회
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              stats.downloadGrowth >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            )}>
              {stats.downloadGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(stats.downloadGrowth)}%
            </div>
          </div>
        </div>

        {/* Recent Orders + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent orders */}
          <div className="rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">최근 주문</h2>
              <Link href="/admin/orders" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-0.5">
                전체보기 <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {recentOrders.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">주문 내역이 없습니다</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 hover:bg-slate-100/80 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{order.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{order.itemCount}개</span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-slate-900">{order.totalAmount.toLocaleString()}원</p>
                      <Badge className={cn(
                        "mt-1 text-[10px] border-0 rounded-full",
                        order.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "CANCELED"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                      )}>
                        {STATUS_LABEL[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">인기 상품 TOP 5</h2>
              <Link href="/admin/products" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-0.5">
                전체보기 <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {topProducts.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">상품이 없습니다</p>
              ) : (
                topProducts.map((product, i) => (
                  <div key={product._id} className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3.5 hover:bg-slate-100/80 transition-colors">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.title}</p>
                      <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {product.downloadCount}회
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{product.price.toLocaleString()}원</p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        매출 {product.revenue.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex flex-col items-center gap-2.5 text-center hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
