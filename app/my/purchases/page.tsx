"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { 
  Download,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Purchase {
  _id: string
  productId: string
  productTitle: string
  amount: number
  purchaseDate: string
  downloadCount: number
  maxDownloads: number
  paymentMethod: string
  paymentStatus: string
}

export default function MyPurchasesPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: false  // NextAuth의 자동 리다이렉트 비활성화
  })
  const simpleAuth = useSimpleAuth()
  
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 두 인증 시스템 통합
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAuthLoading = simpleAuth.isLoading || status === 'loading'

  useEffect(() => {
    // 로딩 중이면 대기
    if (isAuthLoading) {
      return
    }

    // 로딩 완료 후 인증 체크
    if (!isAuthenticated) {
      console.log('인증되지 않음 - 로그인 페이지로 이동')
      router.push('/auth/simple-signin')
      return
    }

    // 인증되었으면 구매 내역 조회
    fetchPurchases()
  }, [isAuthLoading, isAuthenticated, router])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/purchases/my-purchases')
      
      if (!response.ok) {
        throw new Error('구매 내역을 불러올 수 없습니다.')
      }
      
      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (err) {
      console.error('구매 내역 조회 오류:', err)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/download`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || '다운로드에 실패했습니다.')
        return
      }

      const data = await response.json()
      
      // S3 URL로 다운로드
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
        // 페이지 새로고침하여 다운로드 횟수 업데이트
        fetchPurchases()
      }
    } catch (error) {
      console.error('다운로드 오류:', error)
      alert('다운로드 중 오류가 발생했습니다.')
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

  if (isAuthLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">구매 내역을 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link href="/user-dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                마이페이지로 돌아가기
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">구매 내역</h1>
                <p className="text-gray-600 mt-1">
                  {purchases.length}개의 구매 상품
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {purchases.length === 0 ? (
            /* 구매 내역 없음 */
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  구매 내역이 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  다양한 디지털 자료를 구매해보세요!
                </p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <FileText className="w-4 h-4 mr-2" />
                    상품 둘러보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* 구매 내역 목록 */
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase._id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* 상품 정보 */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {purchase.productTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(purchase.purchaseDate).toLocaleDateString('ko-KR')}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-blue-600">
                                  {new Intl.NumberFormat('ko-KR').format(purchase.amount)}원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 상태 정보 */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant={purchase.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}
                            className={purchase.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {purchase.paymentStatus === 'COMPLETED' ? '결제완료' : purchase.paymentStatus}
                          </Badge>
                          <Badge variant="outline">
                            {purchase.paymentMethod}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            다운로드: {purchase.downloadCount}/{purchase.maxDownloads}
                          </Badge>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex flex-col gap-2 md:w-48">
                        <Button
                          onClick={() => handleDownload(purchase.productId)}
                          disabled={purchase.downloadCount >= purchase.maxDownloads}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                        <Link href={`/products/${purchase.productId}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            상품 보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 안내 사항 */}
          {purchases.length > 0 && (
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">다운로드 안내</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>각 상품은 최대 {purchases[0]?.maxDownloads || 10}회까지 다운로드 가능합니다.</li>
                      <li>다운로드 제한에 도달하면 추가 다운로드가 불가능합니다.</li>
                      <li>문제가 있으면 고객센터로 문의해주세요.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

