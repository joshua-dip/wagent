"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import { 
  Package, 
  ExternalLink,
  Star,
  User,
  Calendar,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Eye,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"

export default function SupplementaryMaterialsPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const categories = [
    { id: "all", name: "전체", count: 21 },
    { id: "grade1", name: "고1 자료", count: 7 },
    { id: "grade2", name: "고2 자료", count: 7 },
    { id: "grade3", name: "고3 자료", count: 7 }
  ]

  const materials = [
    {
      id: 1,
      title: "고1 영어 기초 문법 완성",
      description: "고1 필수 영문법을 체계적으로 정리한 부교재",
      category: "grade1",
      price: 4900,
      originalPrice: 6500,
      discountRate: 25,
      rating: 4.7,
      reviewCount: 156,
      author: "김문법 선생님",
      createdAt: "2024-12-15",
      pages: 24,
      solBookLink: "https://solvook.com/",
      tags: ["고1", "문법", "기초", "체계적"]
    },
    {
      id: 2,
      title: "고1 영어 독해 실력 향상 워크북",
      description: "단계별 독해 훈련을 위한 고1 전용 워크북",
      category: "grade1",
      price: 5500,
      originalPrice: 7200,
      discountRate: 24,
      rating: 4.8,
      reviewCount: 203,
      author: "박독해 선생님",
      createdAt: "2024-12-12",
      pages: 32,
      solBookLink: "https://solvook.com/grade1-reading-workbook",
      tags: ["고1", "독해", "워크북", "단계별"]
    },
    {
      id: 3,
      title: "고1 영어 어휘 마스터 교재",
      description: "수능 필수 어휘를 고1 수준에 맞게 정리한 교재",
      category: "grade1",
      price: 4200,
      originalPrice: 5800,
      discountRate: 28,
      rating: 4.6,
      reviewCount: 134,
      author: "이어휘 선생님",
      createdAt: "2024-12-10",
      pages: 18,
      solBookLink: "https://solvook.com/grade1-vocabulary-master",
      tags: ["고1", "어휘", "수능필수", "암기"]
    },
    {
      id: 4,
      title: "고2 영어 심화 문법 트레이닝",
      description: "고2 수준의 심화 문법 개념과 실전 문제",
      category: "grade2",
      price: 5800,
      originalPrice: 7800,
      discountRate: 26,
      rating: 4.8,
      reviewCount: 189,
      author: "김문법 선생님",
      createdAt: "2024-12-08",
      pages: 28,
      solBookLink: "https://solvook.com/grade2-grammar-advanced",
      tags: ["고2", "문법", "심화", "실전"]
    },
    {
      id: 5,
      title: "고2 영어 독해 전략 가이드",
      description: "효과적인 독해 전략과 유형별 접근법",
      category: "grade2",
      price: 6200,
      originalPrice: 8500,
      discountRate: 27,
      rating: 4.9,
      reviewCount: 245,
      author: "박독해 선생님",
      createdAt: "2024-12-05",
      pages: 35,
      solBookLink: "https://solvook.com/grade2-reading-strategy",
      tags: ["고2", "독해", "전략", "유형별"]
    },
    {
      id: 6,
      title: "고2 영어 구문 분석 마스터",
      description: "복잡한 영어 구문을 체계적으로 분석하는 방법",
      category: "grade2",
      price: 5400,
      originalPrice: 7200,
      discountRate: 25,
      rating: 4.7,
      reviewCount: 167,
      author: "정구문 선생님",
      createdAt: "2024-12-03",
      pages: 26,
      solBookLink: "https://solvook.com/grade2-sentence-analysis",
      tags: ["고2", "구문", "분석", "체계적"]
    },
    {
      id: 7,
      title: "고3 수능 영어 실전 문제집",
      description: "수능 출제 경향을 완벽 반영한 고3 실전 문제집",
      category: "grade3",
      price: 7800,
      originalPrice: 10500,
      discountRate: 26,
      rating: 4.9,
      reviewCount: 312,
      author: "이수능 선생님",
      createdAt: "2024-12-01",
      pages: 42,
      solBookLink: "https://solvook.com/grade3-csat-practice",
      tags: ["고3", "수능", "실전", "출제경향"]
    },
    {
      id: 8,
      title: "고3 영어 빈출 어휘 총정리",
      description: "수능에 자주 출제되는 핵심 어휘 완전 정리",
      category: "grade3",
      price: 6800,
      originalPrice: 9200,
      discountRate: 26,
      rating: 4.8,
      reviewCount: 234,
      author: "송어휘 선생님",
      createdAt: "2024-11-28",
      pages: 28,
      solBookLink: "https://solvook.com/grade3-vocabulary-essential",
      tags: ["고3", "어휘", "빈출", "핵심"]
    },
    {
      id: 9,
      title: "고3 영어 작문 완성 가이드",
      description: "수능 영작문과 자유영작 완벽 대비 가이드",
      category: "grade3",
      price: 7200,
      originalPrice: 9800,
      discountRate: 27,
      rating: 4.7,
      reviewCount: 178,
      author: "최작문 선생님",
      createdAt: "2024-11-25",
      pages: 32,
      solBookLink: "https://solvook.com/grade3-writing-complete",
      tags: ["고3", "작문", "영작문", "자유영작"]
    }
  ]

  const filteredMaterials = selectedCategory === "all" 
    ? materials 
    : materials.filter(material => material.category === selectedCategory)

  const handlePurchase = (materialId: number) => {
    if (!isAuthenticated) {
      alert("구매하려면 로그인이 필요합니다.")
      return
    }
    // 구매 로직 구현 예정
    alert(`자료 ${materialId} 구매 기능은 곧 구현됩니다.`)
  }

  const handleSolBookLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <Layout>
      <div className="bg-gray-50 -m-3 sm:-m-6 min-h-full">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-12">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 mr-3" />
            <h1 className="text-4xl font-bold">부교재자료 (쏠북링크)</h1>
          </div>
          <p className="text-xl text-indigo-100 mb-6">
            수업에 바로 활용 가능한 부교재 자료와 쏠북 구매 링크
          </p>
          <div className="flex items-center space-x-6 text-indigo-100">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <span>{materials.length}개 자료</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              <span>평균 4.7점</span>
            </div>
            <div className="flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              <span>쏠북 연동</span>
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
                <CardTitle className="text-lg">학년별 분류</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-indigo-600 text-white"
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

          {/* 자료 목록 */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.name} 
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredMaterials.length}개)
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
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge className="bg-indigo-500 text-white text-xs">쏠북연동</Badge>
                        <Badge variant="outline" className="text-xs">
                          {material.category === "grade1" ? "고1" : material.category === "grade2" ? "고2" : "고3"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {material.rating}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {material.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {material.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {material.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {material.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {material.createdAt}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {material.pages}페이지
                      </div>
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        <span className="text-indigo-600">쏠북연동</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {material.price.toLocaleString()}원
                        </span>
                        {material.originalPrice > material.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">
                              {material.originalPrice.toLocaleString()}원
                            </span>
                            <Badge className="bg-red-100 text-red-600 text-xs">
                              {material.discountRate}% 할인
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* 구매 버튼 */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handlePurchase(material.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          구매하기
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* 쏠북 링크 버튼 */}
                      <Button 
                        variant="outline" 
                        className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleSolBookLink(material.solBookLink)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        쏠북에서 구매하기
                      </Button>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">
                        ⭐ {material.reviewCount}개 리뷰 • 평점 {material.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 쏠북 안내 */}
            <div className="mt-12 bg-indigo-50 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">쏠북(Sol Book) 연동 서비스</h3>
                <p className="text-gray-600 mb-4">
                  PAYPERIC에서 제공하는 부교재는 쏠북에서도 구매하실 수 있습니다.<br />
                  쏠북 링크를 통해 더 다양한 구매 옵션을 확인해보세요.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://solvook.com', '_blank')}
                  >
                    쏠북 홈페이지 방문
                  </Button>
                </div>
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  이전
                </Button>
                <Button size="sm" className="bg-indigo-600 text-white">1</Button>
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
