"use client"

import { useState } from "react"
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
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  Star
} from "lucide-react"
import Link from "next/link"

export default function CustomOrderPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    title: "",
    description: "",
    deadline: "",
    budget: "",
    additionalRequests: ""
  })
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

  const categories = [
    {
      id: "mock-exam",
      title: "모의고사 제작",
      description: "맞춤형 영어 모의고사 문제 제작",
      icon: FileText,
      estimatedTime: "3-5일",
      basePrice: "50,000원~"
    },
    {
      id: "worksheet",
      title: "워크시트 제작", 
      description: "수업용 워크시트 및 학습자료 제작",
      icon: PenTool,
      estimatedTime: "2-3일",
      basePrice: "30,000원~"
    },
    {
      id: "lesson-plan",
      title: "수업 계획서",
      description: "체계적인 수업 계획서 및 교안 제작",
      icon: Calendar,
      estimatedTime: "5-7일", 
      basePrice: "80,000원~"
    },
    {
      id: "assessment",
      title: "평가 도구",
      description: "시험지, 루브릭, 평가 기준 제작",
      icon: CheckCircle,
      estimatedTime: "3-4일",
      basePrice: "40,000원~"
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert("주문 제작 신청을 위해서는 로그인이 필요합니다.")
      return
    }
    // 주문 제작 신청 로직 구현 예정
    alert("주문 제작 신청이 접수되었습니다. 24시간 내에 연락드리겠습니다.")
    console.log("주문 제작 신청:", formData)
  }

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
                맞춤형 교육자료 주문 제작
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                현직 교사가 직접 제작하는 <span className="text-yellow-300 font-semibold">맞춤형 영어 교육자료</span>
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
              주문 제작 서비스
            </h2>
            <p className="text-xl text-gray-600">
              필요한 교육자료를 선택하고 맞춤 제작을 신청하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                  selectedCategory === category.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedCategory(category.id)}
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">예상 기간:</span>
                      <Badge variant="secondary">{category.estimatedTime}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">기본 가격:</span>
                      <span className="font-semibold text-blue-600">{category.basePrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

        {/* 주문 신청 폼 섹션 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                주문 제작 신청
              </h2>
              <p className="text-xl text-gray-600">
                상세한 정보를 입력해주시면 24시간 내에 견적을 제공해드립니다
              </p>
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        성명 *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이름을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        이메일 *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이메일을 입력하세요"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        연락처
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="연락처를 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 제작 정보 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제작 제목 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="제작하고 싶은 자료의 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 설명 *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="제작하고 싶은 자료에 대한 상세한 설명을 입력하세요 (대상 학년, 난이도, 분량, 특별 요구사항 등)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        희망 납기일
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        예산 범위
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">예산 범위를 선택하세요</option>
                        <option value="30000-50000">3만원 - 5만원</option>
                        <option value="50000-100000">5만원 - 10만원</option>
                        <option value="100000-200000">10만원 - 20만원</option>
                        <option value="200000+">20만원 이상</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      추가 요청사항
                    </label>
                    <textarea
                      name="additionalRequests"
                      value={formData.additionalRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="기타 요청사항이나 참고할 내용이 있으시면 입력해주세요"
                    />
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-6">
                    {isAuthenticated ? (
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold"
                      >
                        주문 제작 신청하기
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">주문 제작 신청을 위해 로그인이 필요합니다.</p>
                        <div className="flex gap-4 justify-center">
                          <Link href="/auth/simple-signin">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              로그인
                            </Button>
                          </Link>
                          <Link href="/auth/simple-signup">
                            <Button variant="outline">
                              회원가입
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}
