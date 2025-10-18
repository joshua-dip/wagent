"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Layout from "@/components/Layout"
import { 
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function SummaryFillOrderPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    passageType: "",
    blankCount: "",
    difficulty: "",
    title: "",
    description: "",
    deadline: "",
    budget: "",
    additionalRequests: ""
  })
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
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
      alert("지문 요약 빈칸 채우기 제작 신청을 위해서는 로그인이 필요합니다.")
      return
    }
    alert("지문 요약 빈칸 채우기 제작 신청이 접수되었습니다. 24시간 내에 연락드리겠습니다.")
    console.log("지문 요약 빈칸 채우기 제작 신청:", formData)
  }

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
                  <FileText className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                지문 요약 빈칸 채우기 제작
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                영어 지문을 활용한 <span className="text-yellow-300 font-semibold">맞춤형 요약 빈칸 채우기</span> 문제를 제작해드립니다
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">1-2일</div>
                  <div className="text-sm text-blue-100">제작 기간</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">50,000원~</div>
                  <div className="text-sm text-blue-100">기본 가격</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-blue-100">맞춤 제작</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 주문 신청 폼 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">지문 요약 빈칸 채우기 제작 신청서</CardTitle>
                <p className="text-center text-gray-600">영어 독해력 향상을 위한 맞춤형 요약 문제 제작 정보를 입력해주세요</p>
              </CardHeader>
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
                        <option value="mixed">혼합 학년</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        지문 유형 *
                      </label>
                      <select
                        name="passageType"
                        value={formData.passageType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">지문 유형을 선택하세요</option>
                        <option value="narrative">서사문</option>
                        <option value="expository">설명문</option>
                        <option value="argumentative">논설문</option>
                        <option value="scientific">과학 지문</option>
                        <option value="social">사회 지문</option>
                        <option value="literature">문학 지문</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        빈칸 개수 *
                      </label>
                      <select
                        name="blankCount"
                        value={formData.blankCount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">빈칸 개수를 선택하세요</option>
                        <option value="3-5">3-5개</option>
                        <option value="6-10">6-10개</option>
                        <option value="11-15">11-15개</option>
                        <option value="custom">직접 입력</option>
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
                      <option value="basic">기초 (단순 요약)</option>
                      <option value="intermediate">중급 (핵심 내용 파악)</option>
                      <option value="advanced">고급 (함축적 의미 파악)</option>
                      <option value="csat">수능 수준 (고차원적 사고)</option>
                    </select>
                  </div>

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
                      placeholder="예: 고2 과학 지문 요약 빈칸 채우기"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 요구사항 *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="지문 주제, 길이, 빈칸 위치 선호도, 평가 기준 등을 상세히 입력해주세요"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        희망 납기일 *
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        예산 범위 *
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">예산 범위를 선택하세요</option>
                        <option value="30000-50000">3만원 - 5만원</option>
                        <option value="50000-80000">5만원 - 8만원</option>
                        <option value="80000-120000">8만원 - 12만원</option>
                        <option value="120000+">12만원 이상</option>
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
                      placeholder="답안 제공 방식, 해설 포함 여부, 기타 요청사항 등을 입력해주세요"
                    />
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-6">
                    {isAuthenticated ? (
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold"
                      >
                        지문 요약 빈칸 채우기 제작 신청하기
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">지문 요약 빈칸 채우기 제작 신청을 위해 로그인이 필요합니다.</p>
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

        {/* 안내 섹션 */}
        <section className="py-12 bg-white/50 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    포함 사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 원문 지문 (PDF 형식)</li>
                    <li>• 요약 빈칸 채우기 문제지</li>
                    <li>• 정답 및 해설지</li>
                    <li>• 채점 기준표</li>
                    <li>• 활용 가이드</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    제작 특징
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 학년별 맞춤 난이도 조절</li>
                    <li>• 핵심 내용 중심의 빈칸 배치</li>
                    <li>• 다양한 지문 유형 활용</li>
                    <li>• 단계별 요약 능력 향상</li>
                    <li>• 수능 출제 경향 반영</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
