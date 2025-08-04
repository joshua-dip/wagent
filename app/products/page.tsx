"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  FileText,
  ShoppingCart,
  DollarSign,
  User,
  Calendar,
  Grid3X3,
  List
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
  createdAt: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const categories = [
  { value: 'all', label: '전체' },
  { value: 'development', label: '개발' },
  { value: 'design', label: '디자인' },
  { value: 'business', label: '비즈니스' },
  { value: 'education', label: '교육' },
  { value: 'ebook', label: '전자책' },
  { value: 'template', label: '템플릿' },
  { value: 'other', label: '기타' }
]

export default function ProductsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // URL 파라미터에서 초기값 설정
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    setSelectedCategory(category)
    setSearchTerm(search)
  }, [searchParams])

  // 상품 목록 로드
  const loadProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ProductsResponse = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        console.error('상품 로드 실패')
      }
    } catch (error) {
      console.error('상품 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadProducts(1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">상품을 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">디지털 상품</h1>
          <p className="text-gray-600">프리미엄 PDF 자료를 탐색하고 구매하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* 검색 */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="상품 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* 카테고리 필터 */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* 뷰 모드 */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 목록 */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">상품이 없습니다</h3>
              <p className="text-gray-600">검색 조건을 변경하거나 다른 카테고리를 선택해보세요.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map(product => (
                <Card key={product._id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === product.category)?.label || product.category}
                      </Badge>
                      {getDiscountPercentage(product.price, product.originalPrice) && (
                        <Badge variant="destructive" className="text-xs">
                          -{getDiscountPercentage(product.price, product.originalPrice)}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    {/* 메타 정보 */}
                    <div className="space-y-2 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{product.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-3 h-3" />
                        <span>{product.downloadCount}회 다운로드</span>
                      </div>
                      {product.reviewCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    {/* 태그 */}
                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 가격 및 구매 버튼 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}원
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}원
                          </span>
                        )}
                      </div>
                      <Link href={`/products/${product._id}`}>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          구매
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => loadProducts(pagination.page - 1)}
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
                        onClick={() => loadProducts(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => loadProducts(pagination.page + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}

        {/* 관리자용 업로드 버튼 */}
        {session?.user?.email === 'wnsbr2898@naver.com' && (
          <div className="fixed bottom-6 right-6">
            <Link href="/admin/upload">
              <Button className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <FileText className="w-6 h-6" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}