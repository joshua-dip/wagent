"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import Layout from '@/components/Layout'
import { Download, User, FileText, CreditCard, ChevronRight, Loader2, Star } from 'lucide-react'
import Link from 'next/link'

export default function UserDashboard() {
  const { data: session, status } = useSession({ required: false })
  const simpleAuth = useSimpleAuth()
  const router = useRouter()

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isLoading = simpleAuth.isLoading || status === 'loading'
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" ||
                  simpleAuth.user?.role === 'admin'

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/auth/simple-signin')
      return
    }
    if (isAdmin) router.push('/admin/dashboard')
  }, [isLoading, isAuthenticated, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const initial = (currentUser?.name?.[0] || currentUser?.email?.[0] || '?').toUpperCase()

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>

        {/* 프로필 카드 */}
        <Card className="overflow-hidden rounded-2xl border-gray-200/80">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-semibold text-gray-600">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{currentUser?.name || '회원'}</span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  회원
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 truncate">{currentUser?.email ?? '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 자료 / 결제·계정 카드 2열 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* 자료 */}
          <Card className="rounded-2xl border-gray-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">자료</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-0">
                <li>
                  <Link
                    href="/my/purchases"
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-400" />
                      구매한 자료 다운로드
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/free"
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      공유(무료) 자료
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 결제·계정 */}
          <Card className="rounded-2xl border-gray-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">결제·계정</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-0">
                <li>
                  <Link
                    href="/my/orders"
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      주문 내역
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      이용약관
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:payperic@naver.com"
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-emerald-600 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      고객 문의
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
