"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Layout from "@/components/Layout"
import { 
  CheckCircle,
  User,
  Mail,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function AssessmentOrderPage() {
  const { data: session } = useSession()
  const simpleAuth = useSimpleAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    assessmentType: "",
    title: "",
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
      alert("평가 도구 제작 신청을 위해서는 로그인이 필요합니다.")
      return
    }
    alert("평가 도구 제작 신청이 접수되었습니다. 24시간 내에 연락드리겠습니다.")
    console.log("평가 도구 제작 신청:", formData)
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 -m-3 sm:-m-6 min-h-full">
        {/* 헤더 섹션 */}
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white py-16">
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
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                평가 도구 제작 신청
              </h1>
              <p className="text-xl text-amber-100 mb-6 max-w-2xl mx-auto">
                체계적이고 공정한 <span className="text-yellow-300 font-semibold">평가 도구와 루브릭</span>을 제작해드립니다
              </p>
            </div>
          </div>
        </section>

        {/* 주문 신청 폼 */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">평가 도구 제작 신청서</CardTitle>
                <p className="text-center text-gray-600">공정하고 체계적인 평가 도구 제작을 위한 정보를 입력해주세요</p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        평가 유형 *
                      </label>
                      <select
                        name="assessmentType"
                        value={formData.assessmentType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">평가 유형을 선택하세요</option>
                        <option value="rubric">루브릭</option>
                        <option value="checklist">체크리스트</option>
                        <option value="portfolio">포트폴리오 평가</option>
                        <option value="performance">수행평가</option>
                        <option value="peer">동료평가</option>
                      </select>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">학년을 선택하세요</option>
                        <option value="grade1">고1</option>
                        <option value="grade2">고2</option>
                        <option value="grade3">고3</option>
                      </select>
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-6">
                    {isAuthenticated ? (
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white py-4 text-lg font-semibold"
                      >
                        평가 도구 제작 신청하기
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">평가 도구 제작 신청을 위해 로그인이 필요합니다.</p>
                        <div className="flex gap-4 justify-center">
                          <Link href="/auth/simple-signin">
                            <Button className="bg-amber-600 hover:bg-amber-700">
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
      </div>
    </Layout>
  )
}
