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
  CheckSquare,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

const KAKAO_ORDER_INQUIRY_URL =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_CHAT_URL ?? "https://pf.kakao.com/_qxbvtn/chat"

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
      color: "from-emerald-600 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      features: ["독해/문법/어휘/논리", "다양한 난이도", "출처 맞춤 제작", "해설 포함 가능"]
    },
    {
      id: "subjective",
      title: "서술형 자료 맞춤 제작",
      description: "기출 문제 기반 4단계 변형도 맞춤 제작",
      icon: PenTool,
      color: "from-teal-600 to-emerald-700",
      bgColor: "from-teal-50 to-emerald-50",
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
      <div className="bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-slate-50 -m-3 sm:-m-6 min-h-full">
        {/* 헤더 섹션 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 text-white py-16 shadow-lg shadow-emerald-900/15">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(255,255,255,0.18),transparent)]" aria-hidden />
          <div className="relative px-6 sm:px-8 lg:px-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/15 rounded-2xl backdrop-blur-sm ring-1 ring-white/20">
                  <PenTool className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                서술형 자료 맞춤 제작
              </h1>
              <p className="text-xl text-emerald-50/95 mb-6 max-w-2xl mx-auto">
                기출 문제를 기반으로 제작하는{" "}
                <span className="text-amber-200 font-semibold">맞춤형 서술형 자료</span>
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-emerald-50/95 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-200" />
                  <span>100% 맞춤 제작</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-200" />
                  <span>빠른 납품</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-200" />
                  <span>전문가 제작</span>
                </div>
              </div>
              <div className="mt-10 flex flex-col items-center gap-3 max-w-md mx-auto">
                <a
                  href={KAKAO_ORDER_INQUIRY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    type="button"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 font-semibold bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] border-0 shadow-lg shadow-black/15"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    제작 문의하기
                  </Button>
                </a>
                <p className="text-xs sm:text-sm text-emerald-100/85 text-center leading-relaxed">
                  카카오톡 채널 <span className="font-medium text-white">@payperic</span>로 연결됩니다.
                  <br />
                  요구사항·일정을 남겨 주시면 순차적으로 답변드립니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 섹션 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              변형도별 맞춤 제작 서비스
            </h2>
            <p className="text-xl text-slate-600 mb-4">
              4단계 변형도 레벨로 정확한 난이도의 서술형 문제를 제작합니다
            </p>
            <div className="bg-emerald-50/90 border border-emerald-100 rounded-xl p-4 max-w-4xl mx-auto">
              <p className="text-sm text-emerald-900/90">
                <strong>변형도 기준:</strong> 원문 발췌(레벨1) → 구조 변경(레벨2) → 융합/추론(레벨3) → 요약/재구성(레벨4)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category) => (
              <Link href={`/custom-order/${category.id}`} key={category.id}>
                <Card className="cursor-pointer border-emerald-100/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/8 hover:-translate-y-1 hover:border-emerald-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white w-fit shadow-md shadow-emerald-900/20">
                    <category.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg mb-2">{category.title}</CardTitle>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">난이도:</span>
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50/50">
                        {category.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">작업량:</span>
                      <Badge variant="secondary" className="bg-slate-100">{category.workload}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">문항 단가:</span>
                      <span className="font-semibold text-emerald-700">{category.pricePerItem}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">예상 기간:</span>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-800">{category.estimatedTime}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-emerald-100 pt-2">
                      <span className="text-slate-500">기본 가격:</span>
                      <span className="font-bold text-teal-700">{category.basePrice}</span>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 제작 과정 섹션 */}
        <section className="py-16 bg-white/70 border-t border-emerald-100/80 px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              제작 과정
            </h2>
            <p className="text-xl text-slate-600">
              체계적인 4단계 과정으로 완성도 높은 자료를 제작합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-100 text-teal-800 ring-2 ring-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent transform -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 max-w-xl mx-auto rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-6 sm:p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">먼저 상담부터 하고 싶다면</h3>
            <p className="text-sm text-slate-600 mb-5">
              레벨 선택 전에 견적·일정만 확인하고 싶을 때도 카카오톡으로 편하게 문의해 주세요.
            </p>
            <a href={KAKAO_ORDER_INQUIRY_URL} target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                size="lg"
                className="font-semibold bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] border-0 shadow-md"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                카카오톡으로 제작 문의
              </Button>
            </a>
          </div>
        </section>


      </div>
    </Layout>
  )
}
