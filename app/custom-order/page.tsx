"use client"


import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import { 
  PenTool,
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  DollarSign,
  Star,
  Calendar,
  CheckSquare
} from "lucide-react"
import Link from "next/link"

export default function CustomOrderPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()

  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const serviceTypes = [
    {
      id: "multiple-choice",
      title: "객관식 자료 맞춤 제작",
      description: "수업과 평가에 최적화된 맞춤형 객관식 문제를 제작합니다",
      icon: CheckSquare,
      color: "from-blue-600 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      features: ["독해/문법/어휘/논리", "다양한 난이도", "출처 맞춤 제작", "해설 포함 가능"]
    },
    {
      id: "subjective",
      title: "서술형 자료 맞춤 제작",
      description: "기출 문제 기반 4단계 변형도 맞춤 제작",
      icon: PenTool,
      color: "from-indigo-600 to-purple-600",
      bgColor: "from-indigo-50 to-purple-50",
      features: ["4단계 변형도", "원문 기반 제작", "사고력 문제", "맞춤형 난이도"]
    }
  ]

  const categories = [
    {
      id: "level-1",
      title: "레벨 1 (단순)",
      description: "원문에서 거의 그대로 발췌 → 약간의 문장 단축/단어 치환",
      icon: FileText,
      difficulty: "★",
      workload: "낮음",
      pricePerItem: "300~500원",
      estimatedTime: "당일~1일",
      basePrice: "문항당 300원~"
    },
    {
      id: "level-2",
      title: "레벨 2 (중간)", 
      description: "원문 의미 유지하면서 구조 변경, 어휘/문형 바꾸기",
      icon: PenTool,
      difficulty: "★★",
      workload: "보통",
      pricePerItem: "800~1,500원",
      estimatedTime: "1-2일",
      basePrice: "문항당 800원~"
    },
    {
      id: "level-3",
      title: "레벨 3 (심화)",
      description: "여러 문장을 융합하거나 대조/추론 요소 포함",
      icon: Calendar,
      difficulty: "★★★",
      workload: "높음",
      pricePerItem: "2,000~3,000원",
      estimatedTime: "2-3일", 
      basePrice: "문항당 2,000원~"
    },
    {
      id: "level-4",
      title: "레벨 4 (고급)",
      description: "지문 전체를 새롭게 요약·재구성 + 사고력형 서술 유도",
      icon: CheckCircle,
      difficulty: "★★★★",
      workload: "매우 높음",
      pricePerItem: "4,000원 이상",
      estimatedTime: "3-5일",
      basePrice: "문항당 4,000원~"
    }
  ]

  const process = [
    {
      step: 1,
      title: "주문 접수",
      description: "상세한 요구사항을 접수받습니다",
      icon: MessageSquare
    },
    {
      step: 2,
      title: "견적 제공",
      description: "24시간 내 정확한 견적을 제공합니다",
      icon: DollarSign
    },
    {
      step: 3,
      title: "제작 진행",
      description: "전문 교사가 직접 제작합니다",
      icon: PenTool
    },
    {
      step: 4,
      title: "검토 및 납품",
      description: "품질 검토 후 완성된 자료를 납품합니다",
      icon: CheckCircle
    }
  ]



  return (
    <Layout>
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 -m-3 sm:-m-6 min-h-full">
        {/* 헤더 섹션 */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 sm:px-8 lg:px-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <PenTool className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                서술형 자료 맞춤 제작
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                기출 문제를 기반으로 제작하는 <span className="text-yellow-300 font-semibold">맞춤형 서술형 자료</span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>100% 맞춤 제작</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-300" />
                  <span>빠른 납품</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span>전문가 제작</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 섹션 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              변형도별 맞춤 제작 서비스
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              4단계 변형도 레벨로 정확한 난이도의 서술형 문제를 제작합니다
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-4xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>변형도 기준:</strong> 원문 발췌(레벨1) → 구조 변경(레벨2) → 융합/추론(레벨3) → 요약/재구성(레벨4)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category) => (
              <Link href={`/custom-order/${category.id}`} key={category.id}>
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:shadow-lg"
                >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white w-fit">
                    <category.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg mb-2">{category.title}</CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">난이도:</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        {category.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">작업량:</span>
                      <Badge variant="secondary">{category.workload}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">문항 단가:</span>
                      <span className="font-semibold text-green-600">{category.pricePerItem}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">예상 기간:</span>
                      <Badge variant="outline">{category.estimatedTime}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2">
                      <span className="text-gray-500">기본 가격:</span>
                      <span className="font-bold text-blue-600">{category.basePrice}</span>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 제작 과정 섹션 */}
        <section className="py-16 bg-white/50 px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              제작 과정
            </h2>
            <p className="text-xl text-gray-600">
              체계적인 4단계 과정으로 완성도 높은 자료를 제작합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>


      </div>
    </Layout>
  )
}
