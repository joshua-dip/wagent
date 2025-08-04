"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'

interface Purchase {
  _id: string
  productId: {
    _id: string
    title: string
    description: string
    category: string
    author: string
    fileSize: number
  }
  productTitle: string
  productPrice: number
  downloadCount: number
  maxDownloads: number
  purchaseDate: string
  lastDownloadDate?: string
}

interface PurchasesResponse {
  purchases: Purchase[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const categories = {
  development: '개발',
  design: '디자인',
  business: '비즈니스',
  education: '교육',
  ebook: '전자책',
  template: '템플릿',
  other: '기타'
}

export default function MyPurchasesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PurchasesResponse['pagination'] | null>(null)

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  // 로그인하지 않은 경우
  if (!session) {
    router.push('/auth/signin')
    return null
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/purchases?page=${page}&limit=10`)
      const data: PurchasesResponse = await response.json()

      if (response.ok) {
        setPurchases(data.purchases)
        setPagination(data.pagination)
      } else {
        console.error('구매 목록 로드 실패')
      }
    } catch (error) {
      console.error('구매 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (productId: string, fileName: string) => {
    setDownloading(productId)
    try {
      const response = await fetch(`/api/downloads/${productId}`)
      
      if (response.ok) {
        // 파일 다운로드
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        // 구매 목록 새로고침
        loadPurchases()
      } else {
        const errorData = await response.json()
        alert(errorData.error || '다운로드 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('다운로드 오류:', error)
      alert('다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getDownloadProgress = (downloaded: number, max: number) => {
    return (downloaded / max) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">구매 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 구매 목록</h1>
          <p className="text-gray-600">구매한 디지털 자료를 확인하고 다운로드하세요</p>
        </div>

        {/* 구매 목록 */}
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">구매한 상품이 없습니다</h3>
              <p className="text-gray-600 mb-4">다양한 디지털 자료를 둘러보세요.</p>
              <Link href="/products">
                <Button>상품 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map(purchase => (
              <Card key={purchase._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {purchase.productTitle}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{purchase.productId.author}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {categories[purchase.productId.category as keyof typeof categories] || purchase.productId.category}
                            </Badge>
                            <span>{formatFileSize(purchase.productId.fileSize)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(purchase.productPrice)}원
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {purchase.productId.description}
                      </p>

                      {/* 구매 정보 */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>구매일: {formatDate(purchase.purchaseDate)}</span>
                        </div>
                        {purchase.lastDownloadDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>최근 다운로드: {formatDate(purchase.lastDownloadDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 다운로드 정보 및 버튼 */}
                    <div className="lg:w-64 space-y-3">
                      {/* 다운로드 진행률 */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">다운로드</span>
                          <span className="text-gray-900 font-medium">
                            {purchase.downloadCount}/{purchase.maxDownloads}
                          </span>
                        </div>
                        <Progress 
                          value={getDownloadProgress(purchase.downloadCount, purchase.maxDownloads)} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {purchase.maxDownloads - purchase.downloadCount}회 남음
                        </div>
                      </div>

                      {/* 다운로드 버튼 */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(purchase.productId._id, purchase.productTitle + '.pdf')}
                          disabled={downloading === purchase.productId._id || purchase.downloadCount >= purchase.maxDownloads}
                          className="flex-1"
                        >
                          {downloading === purchase.productId._id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              다운로드 중...
                            </div>
                          ) : purchase.downloadCount >= purchase.maxDownloads ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              다운로드 완료
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              다운로드
                            </>
                          )}
                        </Button>
                        
                        <Link href={`/products/${purchase.productId._id}`}>
                          <Button variant="outline" size="icon">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 페이지네이션 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => loadPurchases(pagination.page - 1)}
                >
                  이전
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => loadPurchases(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => loadPurchases(pagination.page + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}