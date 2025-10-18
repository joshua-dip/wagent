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
  Star, 
  Download, 
  ShoppingCart, 
  Eye,
  Calendar,
  BookOpen
} from "lucide-react"
import Link from "next/link"

export default function EBSEnglishReadingPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const categories = [
    { id: "all", name: "전체", count: 0 },
    { id: "reading-textbook", name: "독해 교재", count: 0 },
    { id: "passage-analysis", name: "지문 분석", count: 0 },
    { id: "reading-skills", name: "독해 기법", count: 0 },
    { id: "practice-tests", name: "연습 문제", count: 0 }
  ]

  // API에서 실제 상품 데이터 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (response.ok) {
        // EBS수능특강영어독해 관련 카테고리만 필터링
        const readingCategories = [
          'reading-textbook', 'passage-analysis', 'reading-skills', 'practice-tests'
        ]
        
        const filteredProducts = data.products.filter((product: any) => 
          readingCategories.includes(product.category) ||
          product.title?.includes('독해') ||
          product.title?.includes('EBS')
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
      id: 2001,
      title: "2025 EBS 수능특강 영어독해연습 전체 교재",
      description: "2025학년도 EBS 수능특강 영어독해연습 교재 전체 PDF",
      category: "reading-textbook",
      price: 12000,
      originalPrice: 16000,
      discountRate: 25,
      isFree: false,
      isNew: true,
      isBestseller: true,
      rating: 4.9,
      reviewCount: 203,
      downloadCount: 1500,
      pages: 280,
      tags: ["EBS", "독해연습", "영어", "전체교재"]
    },
    {
      id: 2002,
      title: "독해 지문 완전 분석 자료집",
      description: "주요 독해 지문의 구조 분석과 해석 가이드",
      category: "passage-analysis",
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      isFree: true,
      isNew: false,
      isBestseller: false,
      rating: 4.5,
      reviewCount: 127,
      downloadCount: 890,
      pages: 150,
      tags: ["지문분석", "무료", "해석가이드"]
    }
  ]

  // 실제 데이터와 샘플 데이터 조합 (ID 충돌 방지)
  const allProducts = [
    ...products.map(product => ({
      ...product,
      id: product._id || product.id,
      key: `real-${product._id || product.id}`
    })),
    ...sampleProducts.map(product => ({
      ...product,
      key: `sample-${product.id}`
    }))
  ]
  
  const filteredProducts = selectedCategory === "all" 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory)

  const handlePurchase = (productId: number) => {
    if (!isAuthenticated) {
      alert("구매하려면 로그인이 필요합니다.")
      return
    }
    alert(`상품 ${productId} 구매 기능은 곧 구현됩니다.`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">상품을 불러오는 중...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gray-50 -m-3 sm:-m-6 min-h-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">EBS 수능특강 영어독해</h1>
          </div>
          <p className="text-xl text-purple-100 mb-6">
            2025학년도 EBS 수능특강 영어독해연습 완벽 대비 자료
          </p>
          <div className="flex items-center space-x-6 text-purple-100">
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
              <span>누적 다운로드 2,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 - 카테고리 필터 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-100 text-purple-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상품 목록 */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.name} 상품
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
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
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {product.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{product.pages || 0}페이지</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        <span>{product.downloadCount || 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags?.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent>
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
                                  -{product.discountRate || 0}%
                                </Badge>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className={`flex-1 ${
                          (product.isFree === true || product.price === 0)
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-purple-600 hover:bg-purple-700'
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
                        ⭐ {product.reviewCount || 0}개 리뷰 • 평점 {product.rating || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}
