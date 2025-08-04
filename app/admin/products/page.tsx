"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Calendar,
  DollarSign,
  ArrowLeft,
  Filter,
  MoreVertical
} from 'lucide-react'

interface Product {
  _id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  author: string
  downloadCount: number
  rating: number
  reviewCount: number
  fileSize: number
  isActive: boolean
  createdAt: string
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

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  // 로그인하지 않은 경우
  if (!session) {
    router.push('/auth/signin')
    return null
  }

  // 관리자가 아닌 경우
  if (session.user?.email !== 'wnsbr2898@naver.com') {
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
    loadProducts()
  }, [searchTerm, selectedCategory])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
      } else {
        console.error('상품 로드 실패')
      }
    } catch (error) {
      console.error('상품 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('상품이 삭제되었습니다.')
        loadProducts()
      } else {
        alert('상품 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error)
      alert('상품 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">상품 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/admin/dashboard">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  관리자 대시보드
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 관리</h1>
              <p className="text-gray-600">업로드된 상품을 확인하고 관리하세요</p>
            </div>
            <Link href="/admin/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                새 상품 업로드
              </Button>
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* 검색 */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="상품 제목, 설명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 카테고리 필터 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    전체
                  </Button>
                  {Object.entries(categories).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상품 목록 */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">상품이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 상품을 업로드해보세요.</p>
              <Link href="/admin/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  상품 업로드하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {product.title}
                            </h3>
                            <Badge 
                              variant={product.isActive ? "default" : "secondary"}
                            >
                              {product.isActive ? "활성" : "비활성"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <Badge variant="outline">
                              {categories[product.category as keyof typeof categories] || product.category}
                            </Badge>
                            <span>{formatFileSize(product.fileSize)}</span>
                            <span>{product.downloadCount}회 다운로드</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}원
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}원
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>등록일: {formatDate(product.createdAt)}</span>
                        </div>
                        <span>작성자: {product.author}</span>
                        {product.tags.length > 0 && (
                          <span>태그: {product.tags.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 lg:flex-col lg:w-32">
                      <Link href={`/products/${product._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          미리보기
                        </Button>
                      </Link>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 통계 요약 */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">총 상품 수</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-gray-600">활성 상품</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {products.reduce((sum, p) => sum + p.downloadCount, 0)}
                </div>
                <div className="text-sm text-gray-600">총 다운로드</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatPrice(products.reduce((sum, p) => sum + p.price, 0))}원
                </div>
                <div className="text-sm text-gray-600">총 상품 가치</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}