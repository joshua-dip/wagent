'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import ProductCard from "@/components/ProductCard"
import CategoryCard from "@/components/CategoryCard"
import FeatureSection from "@/components/FeatureSection"
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
import CategoryCardSkeleton from "@/components/CategoryCardSkeleton"
import LoadingSpinner from "@/components/LoadingSpinner"
import { 
  ShoppingBag, 
  TrendingUp, 
  Star, 
  Users, 
  Search, 
  ArrowRight,
  Crown,
  Zap,
  Sparkles,
  Code,
  Image,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { Settings, Upload, Gift, Download } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const authLoading = simpleAuth.isLoading || status === "loading"
  
  // 관리자인지 확인 (두 시스템 모두 체크)
  const isAdmin = currentUser?.email === "wnsbr2898@naver.com" || 
                  simpleAuth.user?.role === 'admin'

  // useEffect 제거 - 더 이상 필요 없음

  const featuredProducts = [
    {
      id: 1,
      title: "프리미엄 UI/UX 디자인 템플릿 컬렉션",
      description: "현대적이고 세련된 웹사이트 템플릿 50종 + 디자인 시스템 가이드라인",
      thumbnail: "/api/placeholder/400/225",
      price: 89000,
      originalPrice: 150000,
      discountPercentage: 41,
      rating: 4.9,
      reviewCount: 847,
      downloadCount: 12580,
      author: "디자인스튜디오",
      category: "UI/UX",
      tags: ["웹디자인", "템플릿", "UI킷", "반응형"],
      isNew: true,
      isPopular: true
    },
    {
      id: 2,
      title: "React & Next.js 마스터 클래스 강의",
      description: "최신 React 18과 Next.js 13 앱 라우터를 활용한 풀스택 개발 완성 코스",
      thumbnail: "/api/placeholder/400/225",
      price: 149000,
      originalPrice: 299000,
      discountPercentage: 50,
      rating: 4.8,
      reviewCount: 1205,
      downloadCount: 8940,
      author: "코딩마스터",
      category: "개발",
      tags: ["React", "Next.js", "JavaScript", "풀스택"],
      isNew: false,
      isPopular: true
    },
    {
      id: 3,
      title: "AI 생성 프롬프트 엔지니어링 가이드",
      description: "ChatGPT, Claude, Midjourney 등 AI 도구 활용 완벽 가이드북",
      thumbnail: "/api/placeholder/400/225",
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      rating: 4.7,
      reviewCount: 2847,
      downloadCount: 45920,
      author: "AI전문가",
      category: "AI/ML",
      tags: ["AI", "프롬프트", "ChatGPT", "생산성"],
      isNew: true,
      isPopular: false
    },
    {
      id: 4,
      title: "포토샵 & 일러스트레이터 디자인 패키지",
      description: "실무에서 바로 쓸 수 있는 그래픽 디자인 소스 1000종",
      thumbnail: "/api/placeholder/400/225",
      price: 59000,
      originalPrice: 120000,
      discountPercentage: 51,
      rating: 4.6,
      reviewCount: 634,
      downloadCount: 7820,
      author: "그래픽플러스",
      category: "디자인",
      tags: ["포토샵", "일러스트", "그래픽", "템플릿"],
      isNew: false,
      isPopular: true
    }
  ]

  const categories = [
    {
      id: 1,
      title: "개발 & 프로그래밍",
      description: "최신 프로그래밍 강의와 소스코드",
      productCount: 2847,
      icon: Code,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      href: "/categories/development",
      isPopular: true
    },
    {
      id: 2,
      title: "디자인 & 크리에이티브",
      description: "UI/UX, 그래픽 디자인 리소스",
      productCount: 1925,
      icon: Image,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      href: "/categories/design",
      isPopular: true
    },
    {
      id: 3,
      title: "비즈니스 & 마케팅",
      description: "마케팅 전략과 비즈니스 툴킷",
      productCount: 1456,
      icon: TrendingUp,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
      href: "/categories/business",
      isPopular: false
    },
    {
      id: 4,
      title: "교육 & 학습",
      description: "온라인 강의와 교육 자료",
      productCount: 3241,
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-orange-500 to-red-500",
      href: "/categories/education",
      isPopular: true
    }
  ]

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  // 세션이 없어도 메인 페이지를 보여줌 (비로그인 사용자 허용)

  return (
    <Layout>
      <div className="space-y-12">
        {/* 관리자 전용 대시보드 링크 */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">관리자 대시보드</h3>
                  <p className="text-gray-600 text-sm">상품 관리, 업로드, 판매 분석을 확인하세요</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/upload">
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Upload className="w-4 h-4 mr-2" />
                    상품 업로드
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Settings className="w-4 h-4 mr-2" />
                    대시보드 열기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 🎁 무료 자료 다운로드 섹션 🎁 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">무료 자료 다운로드</h3>
                <p className="text-gray-600 text-sm">프리미엄 품질의 무료 디지털 자료를 만나보세요</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/products/free">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <Download className="w-4 h-4 mr-2" />
                  무료 자료 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 🎯 CLEAN WELCOME SECTION 🎯 */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white overflow-hidden">
          {/* 간단한 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {isAuthenticated ? (
                <>안녕하세요, <span className="text-blue-200">{currentUser?.name}</span>님! 👋</>
              ) : (
                <>프리미엄 디지털 콘텐츠의 세계로 오신 것을 환영합니다! 🌟</>
              )}
            </h1>

            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              <span className="font-semibold text-white">WAgent</span>에서 필요한 디지털 자료를 찾아보세요.
              <br />
              <span className="text-blue-200">다양한 프리미엄 콘텐츠</span>를 만나보실 수 있습니다.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/products">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <Search className="h-5 w-5 mr-2" />
                      자료 검색하기
                    </Button>
                  </Link>
                  
                  <Link href="/my/purchases">
                    <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3 rounded-lg backdrop-blur-sm bg-white/10 transition-all duration-200">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      구매 내역 보기
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      로그인하기
                    </Button>
                  </Link>
                  
                  <Link href="/auth/signup">
                    <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3 rounded-lg backdrop-blur-sm bg-white/10 transition-all duration-200">
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 📊 CLEAN STATS SECTION 📊 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 전체 상품 카드 */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">전체 상품</p>
                <p className="text-2xl font-bold text-gray-900">9,057</p>
                <p className="text-xs text-blue-600">다양한 카테고리</p>
              </div>
            </div>
          </Card>

          {/* 이번 주 인기 카드 */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">이번 주 인기</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-green-600">신규 다운로드</p>
              </div>
            </div>
          </Card>

          {/* 평균 평점 카드 */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-xs text-yellow-600">높은 만족도</p>
              </div>
            </div>
          </Card>

          {/* 활성 사용자 카드 */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900">12.5K</p>
                <p className="text-xs text-purple-600">온라인 지금</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 🎯 FEATURED PRODUCTS 🎯 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                오늘의 추천 상품
              </h2>
              <p className="text-gray-600">엄선된 디지털 자료들을 만나보세요</p>
            </div>
            <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
              전체보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>

        {/* 📂 CATEGORIES 📂 */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              카테고리별 자료
            </h2>
            <p className="text-gray-600">원하는 분야의 전문 자료를 찾아보세요</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div key={category.id}>
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>

        {/* ✨ FEATURES SHOWCASE ✨ */}
        <div>
          <FeatureSection />
        </div>
    </div>
    </Layout>
  )
}