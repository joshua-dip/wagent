"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileText, 
  User, 
  Calendar,
  Eye,
  Star,
  Gift,
  DollarSign,
  Tag,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Layout from '@/components/Layout'

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  author: string
  createdAt: string
  fileSize: number
  downloadCount: number
  rating: number
  reviewCount: number
  originalFileName: string
}

export default function ProductDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState('')

  // 상품 정보 조회
  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.product)
      } else {
        console.error('상품 조회 오류:', data.error)
        router.push('/products/free')
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
      router.push('/products/free')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // 다운로드 처리
  const handleDownload = async () => {
    if (!session?.user?.email) {
      router.push('/auth/signin')
      return
    }

    if (!product) return

    try {
      setDownloading(true)
      setDownloadMessage('')

      const response = await fetch(`/api/products/${productId}/download`)
      const data = await response.json()

      if (response.ok) {
        if (data.downloadUrl) {
          // S3 다운로드 URL로 리다이렉트
          window.open(data.downloadUrl, '_blank')
          setDownloadMessage('다운로드가 시작되었습니다!')
        } else {
          // 로컬 파일 다운로드 (직접 다운로드)
          const downloadResponse = await fetch(`/api/products/${productId}/download`)
          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = product.originalFileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            setDownloadMessage('다운로드가 완료되었습니다!')
          } else {
            const errorData = await downloadResponse.json()
            setDownloadMessage(errorData.error || '다운로드 중 오류가 발생했습니다.')
          }
        }

        // 다운로드 카운트 업데이트 (UI)
        setProduct(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null)
      } else {
        setDownloadMessage(data.error || '다운로드 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('다운로드 오류:', error)
      setDownloadMessage('다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
      
      // 메시지 자동 숨김
      setTimeout(() => {
        setDownloadMessage('')
      }, 5000)
    }
  }

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 카테고리 한글 변환
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      development: '개발',
      design: '디자인', 
      business: '비즈니스',
      education: '교육',
      ebook: '전자책',
      template: '템플릿',
      other: '기타'
    }
    return categoryMap[category] || category
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">자료 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">자료를 찾을 수 없습니다</h2>
              <p className="text-gray-600 mb-4">요청하신 자료가 존재하지 않거나 삭제되었습니다.</p>
              <Button onClick={() => router.push('/products/free')} variant="outline">
                무료 자료 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const isFree = product.price === 0

  return (
    <Layout>
      <div className="space-y-8">
        {/* 뒤로가기 */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/products/free')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          무료 자료 목록으로
        </Button>

        {/* 다운로드 메시지 */}
        {downloadMessage && (
          <Card className={`border-2 ${downloadMessage.includes('오류') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-2 ${downloadMessage.includes('오류') ? 'text-red-700' : 'text-green-700'}`}>
                {downloadMessage.includes('오류') ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span className="font-medium">{downloadMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제목 및 기본 정보 */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isFree 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isFree 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isFree ? '무료' : '유료'}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {getCategoryLabel(product.category)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight mb-2">
                      {product.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{product.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{product.downloadCount}회 다운로드</span>
                      </div>
                    </div>
                  </div>
                  {!isFree && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {product.price.toLocaleString()}원
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          {product.originalPrice.toLocaleString()}원
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* 설명 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">자료 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    태그
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 다운로드/구매 카드 */}
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isFree ? '무료 다운로드' : '구매하기'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFree ? (
                  <>
                    <div className="text-center py-4">
                      <Gift className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-700 mb-1">무료 제공!</p>
                      <p className="text-sm text-gray-600">로그인 후 바로 다운로드하세요</p>
                    </div>
                    
                    {session?.user?.email ? (
                      <Button 
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {downloading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            다운로드 중...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            지금 다운로드
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => router.push('/auth/signin')}
                        className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        로그인 후 다운로드
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <DollarSign className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {product.price.toLocaleString()}원
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          정가 {product.originalPrice.toLocaleString()}원
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled
                    >
                      구매 기능 준비 중
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 파일 정보 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">파일 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">파일 형식</span>
                  <span className="font-medium">PDF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">파일 크기</span>
                  <span className="font-medium">{formatFileSize(product.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">파일명</span>
                  <span className="font-medium text-sm truncate ml-2">
                    {product.originalFileName}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}