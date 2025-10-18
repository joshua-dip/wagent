"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
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
  BookOpen
} from "lucide-react"
import Link from "next/link"

export default function English2025MockPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
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

  const sampleProducts = [
    {
      id: 1,
      title: "2025년 3월 모의고사 원문과 해석 완전판",
      description: "전체 지문의 원문과 정확한 해석을 제공하는 완전 분석 자료",
      category: "original-translation",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.9,
      reviewCount: 203,
      downloadCount: 3120,
      author: "김해석 선생님",
      createdAt: "2024-12-20",
      difficulty: "중상",
      pages: 24,
      isNew: true,
      isBestseller: true,
      isFree: true,
      tags: ["원문", "해석", "완전분석", "전지문", "무료"]
    },
    {
      id: 2,
      title: "영어 모의고사 강의용 PPT 자료",
      description: "수업에서 바로 사용할 수 있는 강의용 파워포인트 자료",
      category: "lecture-material",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.8,
      reviewCount: 156,
      downloadCount: 2340,
      author: "박강의 선생님",
      createdAt: "2024-12-18",
      difficulty: "중",
      pages: 32,
      isNew: true,
      isBestseller: false,
      isFree: true,
      tags: ["강의용", "PPT", "수업자료", "프레젠테이션", "무료"]
    },
    {
      id: 3,
      title: "영어 모의고사 수업용 활동지",
      description: "학생 참여형 수업을 위한 다양한 활동지와 워크시트",
      category: "class-material",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.7,
      reviewCount: 134,
      downloadCount: 1890,
      author: "이수업 선생님",
      createdAt: "2024-12-15",
      difficulty: "중하",
      pages: 18,
      isNew: false,
      isBestseller: false,
      isFree: true,
      tags: ["수업용", "활동지", "참여형", "워크시트", "무료"]
    },
    {
      id: 4,
      title: "영어 지문 한줄해석 연습 자료",
      description: "문장별 정확한 해석 연습을 위한 한줄해석 전용 자료",
      category: "line-translation",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.6,
      reviewCount: 98,
      downloadCount: 1560,
      author: "정해석 선생님",
      createdAt: "2024-12-12",
      difficulty: "중하",
      pages: 16,
      isNew: false,
      isBestseller: false,
      isFree: true,
      tags: ["한줄해석", "문장분석", "해석연습", "기초", "무료"]
    },
    {
      id: 5,
      title: "영어 모의고사 영작하기 연습 문제",
      description: "핵심 문장을 영어로 작성하는 영작 연습 문제집",
      category: "english-writing",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.7,
      reviewCount: 167,
      downloadCount: 2010,
      author: "최영작 선생님",
      createdAt: "2024-12-10",
      difficulty: "중상",
      pages: 14,
      isNew: false,
      isBestseller: false,
      isFree: true,
      tags: ["영작", "영어쓰기", "문장작성", "표현연습", "무료"]
    },
    {
      id: 6,
      title: "영어 지문 해석쓰기 완전 정복",
      description: "지문의 핵심 내용을 한국어로 정확히 해석하는 연습 자료",
      category: "translation-writing",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      rating: 4.8,
      reviewCount: 189,
      downloadCount: 2450,
      author: "김번역 선생님",
      createdAt: "2024-12-08",
      difficulty: "중",
      pages: 20,
      isNew: false,
      isBestseller: true,
      isFree: true,
      tags: ["해석쓰기", "번역연습", "의미파악", "정확성", "무료"]
    },
    {
      id: 7,
      title: "영어 워크북 빈칸쓰기 종합 패키지",
      description: "다양한 유형의 빈칸 추론 문제를 체계적으로 정리한 패키지",
      category: "workbook-blanks",
      price: 9800,
      originalPrice: 13000,
      discountRate: 25,
      rating: 4.9,
      reviewCount: 267,
      downloadCount: 3580,
      author: "송빈칸 선생님",
      createdAt: "2024-12-05",
      difficulty: "상",
      pages: 28,
      isNew: false,
      isBestseller: true,
      tags: ["빈칸추론", "워크북", "종합패키지", "체계적"]
    },
    {
      id: 8,
      title: "영어 글의순서 변형문제 4회분",
      description: "모의고사 지문을 활용한 글의순서 변형문제 4회분 완전판",
      category: "order-questions",
      price: 8500,
      originalPrice: 11500,
      discountRate: 26,
      rating: 4.8,
      reviewCount: 234,
      downloadCount: 2890,
      author: "이순서 선생님",
      createdAt: "2024-12-03",
      difficulty: "중상",
      pages: 22,
      isNew: false,
      isBestseller: true,
      tags: ["글의순서", "변형문제", "4회분", "논리적사고"]
    },
    {
      id: 9,
      title: "영어 문장삽입 변형문제 4회분",
      description: "문맥 파악 능력 향상을 위한 문장삽입 변형문제 4회분",
      category: "insertion-questions",
      price: 8200,
      originalPrice: 11000,
      discountRate: 25,
      rating: 4.7,
      reviewCount: 198,
      downloadCount: 2650,
      author: "박삽입 선생님",
      createdAt: "2024-12-01",
      difficulty: "중상",
      pages: 20,
      isNew: false,
      isBestseller: false,
      tags: ["문장삽입", "변형문제", "4회분", "문맥파악"]
    }
  ]

  // 실제 데이터와 샘플 데이터 조합 (ID 충돌 방지)
  const allProducts = [
    ...products.map(product => ({
      ...product,
      id: product._id || product.id, // MongoDB의 _id 사용
      key: `real-${product._id || product.id}` // 고유 키 생성
    })),
    ...sampleProducts.map(product => ({
      ...product,
      key: `sample-${product.id}` // 샘플 데이터용 고유 키
    }))
  ]

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
                      <Button 
                        className={`flex-1 ${
                          product.isFree 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-amber-700 hover:bg-amber-800'
                        }`}
                        onClick={() => handlePurchase(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {(product.isFree === true || product.price === 0) ? '무료 다운로드' : '구매하기'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
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
