"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useRouter } from 'next/navigation'
import { isAdminUser } from '@/utils/auth-utils'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  MoreVertical,
  Settings,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  RefreshCw,
  SortAsc,
  SortDesc
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

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'downloads' | 'price'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{
    title: string
    description: string
    price: string
    originalPrice: string
    category: string
    author: string
    tagsStr: string
  } | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  
  // 관리자인지 확인 (중앙화된 유틸리티 함수 사용)
  const isAdmin = isAdminUser(currentUser?.email, simpleAuth.user?.role)

  // 모든 Hook은 조건부 return 전에 호출되어야 함
  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      loadProducts()
    }
  }, [searchTerm, selectedCategory, isAdmin, isAuthenticated])

  useEffect(() => {
    if (!editingProduct) {
      setEditDraft(null)
      return
    }
    const p = products.find((x) => x._id === editingProduct)
    if (!p) return
    setEditDraft({
      title: p.title,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
      category: p.category,
      author: p.author,
      tagsStr: p.tags.join(', '),
    })
  }, [editingProduct, products])

  useEffect(() => {
    if (!editingProduct) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingProduct(null)
        setEditDraft(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editingProduct])

  // 로딩 중이면 로딩 표시
  if (status === 'loading' || simpleAuth.isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </AdminLayout>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    router.push('/auth/admin-signin?next=/admin/products')
    return null
  }

  // 관리자가 아닌 경우
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Card className="w-full max-w-md mx-auto">
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
      </AdminLayout>
    )
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        showAll: 'true', // 관리자는 모든 상품(활성/비활성) 볼 수 있음
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

  // 선택 관리
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p._id))
    }
  }

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // 상품 상태 토글
  const toggleProductStatus = async (productId: string) => {
    try {
      const product = products.find(p => p._id === productId)
      if (!product) return

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      })

      if (response.ok) {
        loadProducts()
      } else {
        alert('상품 상태 변경 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('상품 상태 변경 오류:', error)
      alert('상품 상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 일괄 상태 변경
  const bulkToggleStatus = async (activate: boolean) => {
    if (selectedProducts.length === 0) {
      alert('상품을 선택해주세요.')
      return
    }

    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: activate })
        })
      )

      await Promise.all(promises)
      setSelectedProducts([])
      loadProducts()
      alert(`${selectedProducts.length}개 상품이 ${activate ? '활성화' : '비활성화'}되었습니다.`)
    } catch (error) {
      console.error('일괄 상태 변경 오류:', error)
      alert('일괄 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const closeEditModal = () => {
    setEditingProduct(null)
    setEditDraft(null)
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !editDraft) return
    const price = parseInt(editDraft.price, 10)
    if (Number.isNaN(price) || price < 0) {
      alert('유효한 가격을 입력해 주세요.')
      return
    }
    let originalPriceSend: number | null
    if (editDraft.originalPrice.trim() === '') {
      originalPriceSend = null
    } else {
      const o = parseInt(editDraft.originalPrice, 10)
      if (Number.isNaN(o) || o < 0) {
        alert('정가는 올바른 숫자로 입력해 주세요.')
        return
      }
      originalPriceSend = o
    }
    const tags = editDraft.tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setSavingEdit(true)
    try {
      const response = await fetch(`/api/products/${editingProduct}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editDraft.title.trim(),
          description: editDraft.description.trim(),
          price,
          originalPrice: originalPriceSend,
          category: editDraft.category,
          tags,
          author: editDraft.author.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        closeEditModal()
        loadProducts()
      } else {
        alert(typeof data.error === 'string' ? data.error : '상품 수정에 실패했습니다.')
      }
    } catch {
      alert('상품 수정 중 오류가 발생했습니다.')
    } finally {
      setSavingEdit(false)
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

  // 일괄 삭제
  const bulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('삭제할 상품을 선택해주세요.')
      return
    }

    if (!confirm(`정말로 선택된 ${selectedProducts.length}개 상품을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/products/${productId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      setSelectedProducts([])
      loadProducts()
      alert(`${selectedProducts.length}개 상품이 삭제되었습니다.`)
    } catch (error) {
      console.error('일괄 삭제 오류:', error)
      alert('일괄 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  // 상품 정렬 및 필터링
  const sortedAndFilteredProducts = products
    .filter(product => {
      // 활성 상품만 표시 필터
      if (showActiveOnly && !product.isActive) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'downloads':
          comparison = a.downloadCount - b.downloadCount
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">상품 목록을 불러오는 중...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="-m-3 sm:-m-6 min-h-full bg-gray-50 p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">상품 관리</h1>
              <p className="text-gray-600">업로드된 상품을 확인하고 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => loadProducts()}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
              <Link href="/admin/upload">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  새 상품 업로드
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 툴바 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
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

              {/* 필터 및 정렬 */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 활성 상품만 표시 */}
                <Button
                  variant={showActiveOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                  {showActiveOnly ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                  활성만
                </Button>

                {/* 정렬 */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="date">등록일순</option>
                  <option value="title">제목순</option>
                  <option value="downloads">다운로드순</option>
                  <option value="price">가격순</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                전체 ({products.length})
              </Button>
              {Object.entries(categories).slice(0, 8).map(([key, label]) => {
                const count = products.filter(p => p.category === key).length
                if (count === 0) return null
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {label} ({count})
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
        {/* 일괄 작업 툴바 */}
        {selectedProducts.length > 0 && (
          <Card className="mb-4 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700 font-medium">
                  {selectedProducts.length}개 상품 선택됨
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkToggleStatus(true)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    일괄 활성화
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkToggleStatus(false)}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    일괄 비활성화
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    일괄 삭제
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedProducts([])}
                  >
                    선택 해제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 상품 목록 */}
        {sortedAndFilteredProducts.length === 0 ? (
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
          <div className="space-y-3">
            {/* 전체 선택 헤더 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedProducts.length === sortedAndFilteredProducts.length && sortedAndFilteredProducts.length > 0 ? 
                        <CheckSquare className="w-4 h-4" /> : 
                        <Square className="w-4 h-4" />
                      }
                    </Button>
                    <span className="text-sm font-medium text-gray-700">
                      {sortedAndFilteredProducts.length}개 상품 표시 중
                      {selectedProducts.length > 0 && ` (${selectedProducts.length}개 선택)`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {sortBy === 'date' && '등록일순'}
                    {sortBy === 'title' && '제목순'}
                    {sortBy === 'downloads' && '다운로드순'}
                    {sortBy === 'price' && '가격순'}
                    {' '}
                    {sortOrder === 'asc' ? '오름차순' : '내림차순'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상품 목록 */}
            {sortedAndFilteredProducts.map(product => (
              <Card key={product._id} className={`hover:shadow-md transition-all ${selectedProducts.includes(product._id) ? 'ring-2 ring-emerald-200 bg-emerald-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* 체크박스 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSelectProduct(product._id)}
                      className="mt-1"
                    >
                      {selectedProducts.includes(product._id) ? 
                        <CheckSquare className="w-4 h-4" /> : 
                        <Square className="w-4 h-4" />
                      }
                    </Button>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {product.title}
                            </h3>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "활성" : "비활성"}
                            </Badge>
                            {product.price === 0 && (
                              <Badge className="bg-green-500">무료</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <Badge variant="outline">
                              {categories[product.category as keyof typeof categories] || product.category}
                            </Badge>
                            <span>{formatFileSize(product.fileSize)}</span>
                            <span>{product.downloadCount}회 다운로드</span>
                            <span>{formatDate(product.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
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

                      {/* 태그 */}
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1 shrink-0 relative z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductStatus(product._id)}
                        className={product.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {product.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </Button>
                      
                      <Link href={`/products/${product._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product._id)}
                        aria-label="상품 수정"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 통계 요약 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">상품 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{products.length}</div>
                <div className="text-sm text-gray-600">총 상품</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-gray-600">활성 상품</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {products.filter(p => !p.isActive).length}
                </div>
                <div className="text-sm text-gray-600">비활성 상품</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {products.reduce((sum, p) => sum + (p.downloadCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">총 다운로드</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {products.filter(p => p.price === 0).length}
                </div>
                <div className="text-sm text-gray-600">무료 상품</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 수정 모달 */}
        {editingProduct && editDraft && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="presentation"
            onClick={closeEditModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-product-title"
              className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="edit-product-title" className="text-lg font-semibold text-gray-900 mb-4">
                상품 수정
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">제목</Label>
                  <Input
                    id="edit-title"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, title: e.target.value } : d))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-desc">설명</Label>
                  <Textarea
                    id="edit-desc"
                    value={editDraft.description}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, description: e.target.value } : d))}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-price">판매가 (원)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min={0}
                      value={editDraft.price}
                      onChange={(e) => setEditDraft((d) => (d ? { ...d, price: e.target.value } : d))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-original">정가 (원, 비우면 없음)</Label>
                    <Input
                      id="edit-original"
                      type="number"
                      min={0}
                      value={editDraft.originalPrice}
                      onChange={(e) => setEditDraft((d) => (d ? { ...d, originalPrice: e.target.value } : d))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-category">카테고리</Label>
                  <select
                    id="edit-category"
                    value={editDraft.category}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, category: e.target.value } : d))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-author">저자</Label>
                  <Input
                    id="edit-author"
                    value={editDraft.author}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, author: e.target.value } : d))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags">태그 (쉼표로 구분)</Label>
                  <Input
                    id="edit-tags"
                    value={editDraft.tagsStr}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, tagsStr: e.target.value } : d))}
                    className="mt-1"
                    placeholder="예: 모의고사, 영어"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={closeEditModal} disabled={savingEdit}>
                  취소
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? '저장 중…' : '저장'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}