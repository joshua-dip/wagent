"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/Layout"
import { 
  CheckSquare,
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  ArrowLeft,
  FileText,
  BookOpen,
  Target
} from "lucide-react"
import Link from "next/link"

export default function MultipleChoiceOrderPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    questionType: "",
    sourceType: "",
    numQuestions: "",
    difficulty: "",
    topic: "",
    description: "",
    deadline: "",
    budget: "",
    additionalRequests: ""
  })
  
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session

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
      alert("객관식 자료 제작 신청을 위해서는 로그인이 필요합니다.")
      return
    }
    alert("객관식 자료 제작 신청이 접수되었습니다. 24시간 내에 연락드리겠습니다.")
    console.log("객관식 자료 제작 신청:", formData)
  }

  const questionTypes = [
    {
      type: "독해",
      description: "지문 이해, 주제 파악, 세부 정보 등",
      examples: ["주제/제목", "내용 일치", "빈칸 추론", "지칭 추론"]
    },
    {
      type: "문법",
      description: "문법 사항 적용 및 판단",
      examples: ["어법 선택", "문장 완성", "오류 찾기"]
    },
    {
      type: "어휘",
      description: "단어 및 표현의 이해",
      examples: ["빈칸 어휘", "어휘 의미 파악", "유의어/반의어"]
    },
    {
      type: "논리",
      description: "글의 구조와 논리 흐름",
      examples: ["순서 배열", "문장 위치", "무관한 문장"]
    }
  ]

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -m-3 sm:-m-6 min-h-full">
        {/* 헤더 섹션 */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 sm:px-8 lg:px-12">
            <div className="flex items-center mb-6">
              <Link href="/custom-order">
                <Button variant="ghost" className="text-white hover:bg-white/20 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  돌아가기
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CheckSquare className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                객관식 자료 맞춤 제작
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                수업과 평가에 최적화된 <span className="text-yellow-300 font-semibold">맞춤형 객관식 문제</span>를 제작해드립니다
              </p>
            </div>
          </div>
        </section>

        {/* 객관식 문제 유형 소개 */}
        <section className="py-12 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              제작 가능한 객관식 문제 유형
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {questionTypes.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">{item.type}</CardTitle>
                    <p className="text-sm text-gray-600 text-center">{item.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {item.examples.map((example, i) => (
                        <Badge key={i} variant="secondary" className="w-full justify-center">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 주문 신청 폼 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">객관식 자료 제작 신청서</CardTitle>
                <p className="text-center text-gray-600">맞춤형 객관식 문제 제작을 위한 상세 정보를 입력해주세요</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      신청자 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이름 *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="홍길동"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일 *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="example@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          연락처 *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="010-1234-5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 문제 정보 */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CheckSquare className="h-5 w-5 mr-2" />
                      문제 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          문제 유형 *
                        </label>
                        <select
                          name="questionType"
                          value={formData.questionType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">문제 유형을 선택하세요</option>
                          <option value="reading-main">독해 - 주제/제목</option>
                          <option value="reading-detail">독해 - 세부정보</option>
                          <option value="reading-inference">독해 - 빈칸/추론</option>
                          <option value="grammar">문법</option>
                          <option value="vocabulary">어휘</option>
                          <option value="logic-order">논리 - 순서배열</option>
                          <option value="logic-position">논리 - 문장위치</option>
                          <option value="logic-irrelevant">논리 - 무관한 문장</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          출처/소재 *
                        </label>
                        <select
                          name="sourceType"
                          value={formData.sourceType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">출처를 선택하세요</option>
                          <option value="mock-exam">모의고사 기출</option>
                          <option value="ebs">EBS 교재</option>
                          <option value="textbook">교과서</option>
                          <option value="custom">선생님 제공 지문</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          문항 수 *
                        </label>
                        <input
                          type="number"
                          name="numQuestions"
                          value={formData.numQuestions}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          대상 학년 *
                        </label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">학년을 선택하세요</option>
                          <option value="grade1">고1</option>
                          <option value="grade2">고2</option>
                          <option value="grade3">고3</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        난이도 *
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">난이도를 선택하세요</option>
                        <option value="easy">하 (기본 개념 확인)</option>
                        <option value="medium">중 (평균 수준)</option>
                        <option value="hard">상 (심화/수능 수준)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        주제/소재 (선택)
                      </label>
                      <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 환경, 기술, 인문학 등"
                      />
                    </div>
                  </div>

                  {/* 상세 요청사항 */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      상세 요청사항
                    </h3>
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
                        placeholder="예: 2024년 9월 모의고사 22-25번을 활용한 독해 문제 10개 제작. 원문의 난이도는 유지하되, 선지와 오답을 새롭게 구성해주세요."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          희망 납품일 *
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          예산 (선택)
                        </label>
                        <input
                          type="text"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="예: 50,000원"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        추가 요청사항 (선택)
                      </label>
                      <textarea
                        name="additionalRequests"
                        value={formData.additionalRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="해설지 포함 여부, 특정 문법 사항 포함/제외, 특정 어휘 수준 등 추가 요청사항을 입력해주세요."
                      />
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-6">
                    {isAuthenticated ? (
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold"
                      >
                        객관식 자료 제작 신청하기
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">객관식 자료 제작 신청을 위해 로그인이 필요합니다.</p>
                        <div className="flex gap-4 justify-center">
                          <Link href="/auth/simple-signin">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              로그인
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

        {/* 안내 사항 */}
        <section className="py-12 px-6 sm:px-8 lg:px-12 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">유의사항</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>신청서 접수 후 24시간 내에 상세 견적을 제공해드립니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>문항 수와 난이도에 따라 제작 기간과 비용이 달라질 수 있습니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>저작권이 있는 자료의 경우, 교육용 목적으로만 사용 가능합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>완성된 자료는 PDF 형식으로 제공되며, 해설 포함 여부는 선택 가능합니다.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}

