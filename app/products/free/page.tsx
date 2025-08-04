"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Download, 
  Search, 
  FileText, 
  User, 
  Calendar,
  Filter,
  Gift,
  Star,
  Eye
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
}

interface ApiResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    category?: string
    isFree: boolean
    search?: string
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

export default function FreeProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 상품 목록 조회
  const fetchProducts = async (page = 1, category = selectedCategory, search = searchTerm) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        free: 'true', // 무료 상품만
        ...(category !== 'all' && { category }),
        ...(search && { search })
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
        setCurrentPage(page)
      } else {
        console.error('상품 조회 오류:', data.error)
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts(1, selectedCategory, searchTerm)
  }

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    fetchProducts(1, category, searchTerm)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    fetchProducts(page, selectedCategory, searchTerm)
  }

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 상품 상세 페이지로 이동
  const goToProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">무료 자료를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">무료 자료 다운로드</h1>
          </div>
          <p className="text-gray-600 text-lg">프리미엄 품질의 무료 디지털 자료를 만나보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 검색 */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="자료를 검색해보세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>

              {/* 카테고리 필터 */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 목록 */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product._id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => goToProduct(product._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            무료
                          </span>
                        </div>
                        <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="space-y-3">
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{product.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{product.downloadCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{formatFileSize(product.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* 태그 */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">+{product.tags.length - 3}</span>
                          )}
                        </div>
                      )}
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  이전
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500 mb-4">다른 키워드로 검색해보세요.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  fetchProducts(1, 'all', '')
                }}
              >
                전체 보기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}