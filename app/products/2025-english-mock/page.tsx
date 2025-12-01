"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import { 
  FileText, 
  Download,
  Star,
  Clock,
  User,
  ShoppingCart,
  Eye,
  Calendar,
  BookOpen,
  Check,
  Heart
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function English2025MockPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const { addToCart, isInCart } = useCart()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  // 공유자료 카테고리에 해당하는 무료 자료 유형들
  const sharedMaterialCategories = [
    'original-translation', 'lecture-material', 'class-material', 
    'line-translation', 'english-writing', 'translation-writing'
  ]

  // API에서 실제 상품 데이터 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (response.ok) {
        // 2025 영어모의고사 관련 카테고리만 필터링
        const mockExamCategories = [
          'original-translation', 'lecture-material', 'class-material', 
          'line-translation', 'english-writing', 'translation-writing',
          'workbook-blanks', 'order-questions', 'insertion-questions'
        ]
        
        const filteredProducts = data.products.filter((product: any) => 
          mockExamCategories.includes(product.category)
        )
        
        setProducts(filteredProducts)
      } else {
        console.error('상품 로드 실패:', data.error)
      }
    } catch (error) {
      console.error('상품 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // API에서 가져온 실제 상품만 사용
  const allProducts = products.map(product => ({
    ...product,
    id: product._id || product.id, // MongoDB의 _id 사용
    key: `real-${product._id || product.id}`, // 고유 키 생성
    // 기본값 설정
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    downloadCount: product.downloadCount || 0,
    difficulty: product.difficulty || '중',
    pages: product.pages || 0,
    tags: product.tags || [],
    isFree: product.price === 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }))

  // 카테고리별 상품 개수 계산
  const getSharedMaterialsCount = () => {
    return allProducts.filter(product => 
      sharedMaterialCategories.includes(product.category) || 
      (product.isFree === true || product.price === 0)
    ).length
  }

  const categories = [
    { id: "all", name: "전체", count: allProducts.length },
    { id: "shared-materials", name: "공유자료", count: getSharedMaterialsCount() },
    { id: "workbook-blanks", name: "워크북 빈칸쓰기 패키지", count: allProducts.filter(p => p.category === "workbook-blanks").length },
    { id: "order-questions", name: "변형문제_글의순서 4회분", count: allProducts.filter(p => p.category === "order-questions").length },
    { id: "insertion-questions", name: "변형문제_문장삽입 4회분", count: allProducts.filter(p => p.category === "insertion-questions").length }
  ]
  
  const filteredProducts = selectedCategory === "all" 
    ? allProducts 
    : selectedCategory === "shared-materials"
    ? allProducts.filter(product => 
        sharedMaterialCategories.includes(product.category) || 
        (product.isFree === true || product.price === 0)
      )
    : allProducts.filter(product => product.category === selectedCategory)

  const handlePurchase = (productId: number) => {
    if (!isAuthenticated) {
      alert("구매하려면 로그인이 필요합니다.")
      return
    }
    // 구매 로직 구현 예정
    alert(`상품 ${productId} 구매 기능은 곧 구현됩니다.`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">상품을 불러오는 중...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gray-50 -m-3 sm:-m-6 min-h-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-900 text-white py-12">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 mr-3" />
            <h1 className="text-4xl font-bold">2025 영어모의고사</h1>
          </div>
          <p className="text-xl text-amber-100 mb-6">
            최신 출제경향을 반영한 2025년도 영어 모의고사 컬렉션
          </p>
          <div className="flex items-center space-x-6 text-amber-100">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <span>{allProducts.length}개 상품</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              <span>평균 4.7점</span>
            </div>
            <div className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              <span>총 12,690회 다운로드</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 필터 */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-amber-700 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상품 목록 */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "shared-materials" 
                  ? "공유자료"
                  : `${categories.find(c => c.id === selectedCategory)?.name} 상품`
                }
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredProducts.length}개)
                </span>
              </h2>
              {selectedCategory === "shared-materials" && (
                <p className="text-sm text-gray-600 mb-4">
                  원문과 해석, 강의용자료, 수업용자료, 한줄해석, 영작하기, 해석쓰기
                </p>
              )}
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>최신순</option>
                <option>인기순</option>
                <option>낮은 가격순</option>
                <option>높은 가격순</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.key || product.id || product._id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {(product.isFree === true || product.price === 0) && (
                          <Badge className="bg-green-500 text-white text-xs">무료</Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-blue-500 text-white text-xs">NEW</Badge>
                        )}
                        {product.isBestseller && (
                          <Badge className="bg-red-500 text-white text-xs">베스트</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {product.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {product.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {product.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {product.createdAt}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {product.pages}페이지
                      </div>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {product.downloadCount.toLocaleString()}회
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {(product.isFree === true || product.price === 0) ? (
                          <span className="text-2xl font-bold text-green-600">
                            무료
                          </span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-gray-900">
                              {(product.price || 0).toLocaleString()}원
                            </span>
                            {product.originalPrice && product.originalPrice > (product.price || 0) && (
                              <>
                                <span className="text-gray-400 line-through text-sm">
                                  {product.originalPrice.toLocaleString()}원
                                </span>
                                <Badge className="bg-red-100 text-red-600 text-xs">
                                  {product.discountRate}% 할인
                                </Badge>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* 장바구니 버튼 - 유료 상품만 */}
                      {product.price > 0 && (
                        isInCart(product._id || product.id) ? (
                          <Button 
                            variant="outline"
                            className="flex-1 bg-gray-50"
                            onClick={() => router.push('/cart')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            장바구니에 담김
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              addToCart({
                                productId: product._id || product.id,
                                title: product.title,
                                price: product.price,
                                originalPrice: product.originalPrice,
                                category: product.category
                              })
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            장바구니
                          </Button>
                        )
                      )}
                      
                      <Button 
                        className={`${product.price > 0 ? 'flex-1' : 'flex-1'} ${
                          product.isFree || product.price === 0
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-amber-700 hover:bg-amber-800'
                        }`}
                        onClick={() => {
                          if (product._id) {
                            router.push(`/products/${product._id}`)
                          } else {
                            handlePurchase(product.id)
                          }
                        }}
                      >
                        {(product.isFree === true || product.price === 0) ? (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            무료 다운로드
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            상세보기
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">
                        ⭐ {product.reviewCount}개 리뷰 • 평점 {product.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  이전
                </Button>
                <Button size="sm" className="bg-amber-700 text-white">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">
                  다음
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}
