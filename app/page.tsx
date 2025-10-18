"use client"

import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import { 
  BookOpen, 
  FileText, 
  Star,
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const categories = [
    {
      title: "2025 영어모의고사",
      href: "/products/2025-english-mock",
      icon: FileText,
      description: "최신 출제경향을 반영한 2025년도 영어 모의고사",
      productCount: 24,
      isNew: true
    },

    {
      title: "EBS수능특강영어",
      href: "/products/ebs-special-english",
      icon: BookOpen,
      description: "EBS 수능특강 영어 완벽 분석 자료",
      productCount: 18
    },
    {
      title: "EBS수능특강영어독해",
      href: "/products/ebs-english-reading",
      icon: BookOpen,
      description: "독해 실력 향상을 위한 EBS 특강 자료",
      productCount: 15
    },
    {
      title: "부교재자료",
      href: "/products/supplementary-materials",
      icon: BookOpen,
      description: "수업에 바로 활용 가능한 부교재 자료",
      productCount: 28
    }
  ]

  const features = [
    {
      icon: Award,
      title: "검증된 품질",
      description: "현직 교사들이 직접 검토한 고품질 교육 자료"
    },
    {
      icon: Clock,
      title: "즉시 다운로드",
      description: "구매 후 바로 다운로드하여 사용 가능"
    },
    {
      icon: Users,
      title: "1만+ 교사 선택",
      description: "전국 1만 명 이상의 교사들이 이용"
    },
    {
      icon: CheckCircle,
      title: "지속 업데이트",
      description: "최신 출제경향을 반영한 지속적인 업데이트"
    }
  ]

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -m-3 sm:-m-6 min-h-full">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {isAuthenticated ? (
                <>안녕하세요, <span className="text-yellow-300">{currentUser?.name || currentUser?.email}</span>님! 👋</>
              ) : (
                <>고등 영어 서술형 자료의 새로운 기준<br />
                <span className="text-emerald-300">PAYPERIC</span></>
              )}
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              250개 학교의 기출 문제를 분석하여 만든 검증된 영어 서술형 자료로<br />
              <span className="text-yellow-200 font-semibold">더 효과적인 수업</span>을 만들어보세요
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/simple-signup">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 text-lg">
                    무료 회원가입
                  </Button>
                </Link>
                <Link href="/auth/simple-signin">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
                    로그인
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-12 sm:py-16">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              카테고리별 교육 자료
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              필요한 자료를 카테고리별로 쉽게 찾아보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="flex gap-2">
                      {category.isNew && (
                        <Badge className="bg-green-500 text-white">NEW</Badge>
                      )}
                      {category.isPopular && (
                        <Badge className="bg-red-500 text-white">인기</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {category.productCount}개 상품
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <Link href={category.href}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      상품 보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-12 sm:py-16 bg-white/50">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 PAYPERIC을 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              교사들이 직접 선택한 이유가 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="text-center px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            수천 명의 교사들이 이미 경험한 차별화된 교육 자료
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products/2025-english-mock">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 text-lg">
                2025 모의고사 보기
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth/simple-signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
                  무료 회원가입
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
      </div>
    </Layout>
  )
}