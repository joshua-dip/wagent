"use client"

import { useState } from "react"
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
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const categories = [
    { id: "all", name: "전체", count: 18 },
    { id: "2025-03-grade1", name: "25년 3월 고1", count: 3 },
    { id: "2025-03-grade2", name: "25년 3월 고2", count: 3 },
    { id: "2025-03-grade3", name: "25년 3월 고3", count: 3 },
    { id: "2025-06-grade1", name: "25년 6월 고1", count: 3 },
    { id: "2025-06-grade2", name: "25년 6월 고2", count: 3 },
    { id: "2025-06-grade3", name: "25년 6월 고3", count: 3 }
  ]

  const products = [
    {
      id: 1,
      title: "2025년 3월 고1 전국연합학력평가 영어",
      description: "고1 수준에 맞춘 3월 전국연합학력평가 영어 모의고사와 상세 해설",
      category: "2025-03-grade1",
      price: 6900,
      originalPrice: 9000,
      discountRate: 23,
      rating: 4.8,
      reviewCount: 89,
      downloadCount: 1420,
      author: "김고1 선생님",
      createdAt: "2024-12-20",
      difficulty: "중하",
      pages: 12,
      isNew: true,
      isBestseller: false,
      tags: ["고1", "3월", "전국연합", "기초"]
    },
    {
      id: 2,
      title: "2025년 3월 고2 전국연합학력평가 영어",
      description: "고2 수준에 맞춘 3월 전국연합학력평가 영어 모의고사와 완벽 해설",
      category: "2025-03-grade2",
      price: 7500,
      originalPrice: 10000,
      discountRate: 25,
      rating: 4.9,
      reviewCount: 156,
      downloadCount: 2340,
      author: "박고2 선생님",
      createdAt: "2024-12-18",
      difficulty: "중",
      pages: 14,
      isNew: true,
      isBestseller: true,
      tags: ["고2", "3월", "전국연합", "중급"]
    },
    {
      id: 3,
      title: "2025년 3월 고3 전국연합학력평가 영어",
      description: "수능 수준의 3월 전국연합학력평가 영어 모의고사와 심화 해설",
      category: "2025-03-grade3",
      price: 8900,
      originalPrice: 12000,
      discountRate: 26,
      rating: 4.9,
      reviewCount: 203,
      downloadCount: 3120,
      author: "이고3 선생님",
      createdAt: "2024-12-15",
      difficulty: "상",
      pages: 16,
      isNew: true,
      isBestseller: true,
      tags: ["고3", "3월", "전국연합", "수능준비"]
    },
    {
      id: 4,
      title: "2025년 6월 고1 전국연합학력평가 영어",
      description: "1학기 학습 내용을 반영한 6월 고1 모의고사와 상세 분석",
      category: "2025-06-grade1",
      price: 7200,
      originalPrice: 9500,
      discountRate: 24,
      rating: 4.7,
      reviewCount: 78,
      downloadCount: 1680,
      author: "김고1 선생님",
      createdAt: "2024-12-12",
      difficulty: "중",
      pages: 13,
      isNew: false,
      isBestseller: false,
      tags: ["고1", "6월", "전국연합", "1학기"]
    },
    {
      id: 5,
      title: "2025년 6월 고2 전국연합학력평가 영어",
      description: "고2 심화 과정을 담은 6월 모의고사와 체계적 해설",
      category: "2025-06-grade2",
      price: 7800,
      originalPrice: 10500,
      discountRate: 26,
      rating: 4.8,
      reviewCount: 134,
      downloadCount: 2150,
      author: "박고2 선생님",
      createdAt: "2024-12-10",
      difficulty: "중상",
      pages: 15,
      isNew: false,
      isBestseller: false,
      tags: ["고2", "6월", "전국연합", "심화"]
    },
    {
      id: 6,
      title: "2025년 6월 고3 전국연합학력평가 영어",
      description: "수능 최종 점검을 위한 6월 고3 모의고사와 실전 해설",
      category: "2025-06-grade3",
      price: 9200,
      originalPrice: 12500,
      discountRate: 26,
      rating: 4.9,
      reviewCount: 187,
      downloadCount: 2890,
      author: "이고3 선생님",
      createdAt: "2024-12-08",
      difficulty: "상",
      pages: 17,
      isNew: false,
      isBestseller: true,
      tags: ["고3", "6월", "전국연합", "수능최종"]
    }
  ]

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const handlePurchase = (productId: number) => {
    if (!isAuthenticated) {
      alert("구매하려면 로그인이 필요합니다.")
      return
    }
    // 구매 로직 구현 예정
    alert(`상품 ${productId} 구매 기능은 곧 구현됩니다.`)
  }

  return (
    <Layout>
      <div className="bg-gray-50 -m-3 sm:-m-6 min-h-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 mr-3" />
            <h1 className="text-4xl font-bold">2025 영어모의고사</h1>
          </div>
          <p className="text-xl text-blue-100 mb-6">
            최신 출제경향을 반영한 2025년도 영어 모의고사 컬렉션
          </p>
          <div className="flex items-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <span>{products.length}개 상품</span>
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
                          ? "bg-blue-600 text-white"
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
                {categories.find(c => c.id === selectedCategory)?.name} 상품
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredProducts.length}개)
                </span>
              </h2>
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>최신순</option>
                <option>인기순</option>
                <option>낮은 가격순</option>
                <option>높은 가격순</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {product.isNew && (
                          <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
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
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price.toLocaleString()}원
                        </span>
                        {product.originalPrice > product.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">
                              {product.originalPrice.toLocaleString()}원
                            </span>
                            <Badge className="bg-red-100 text-red-600 text-xs">
                              {product.discountRate}% 할인
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handlePurchase(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        구매하기
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
                <Button size="sm" className="bg-blue-600 text-white">1</Button>
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
