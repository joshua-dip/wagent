"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShoppingBag, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else {
        // 세션 확인 후 리디렉션
        const session = await getSession()
        if (session) {
          // 관리자인 경우 관리자 대시보드로 이동
          if (email === "wnsbr2898@naver.com") {
            router.push("/admin/dashboard")
          } else {
            router.push("/")
          }
        }
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillAdminAccount = () => {
    setEmail("wnsbr2898@naver.com")
    setPassword("123456")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 브랜드 로고 및 제목 */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WAgent</h1>
          <p className="text-gray-600">프리미엄 디지털 자료 마켓플레이스</p>
        </div>

        {/* 로그인 폼 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">로그인</CardTitle>
            <CardDescription className="text-center">
              계정에 로그인하여 다양한 자료를 둘러보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일</label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            {/* 관리자 계정 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">관리자 로그인</p>
              <button
                onClick={fillAdminAccount}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium">관리자</div>
                <div className="text-gray-600">wnsbr2898@naver.com</div>
              </button>
            </div>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <div className="text-center text-sm text-gray-500">
          <p>로그인하면 WAgent의 서비스 약관에 동의하게 됩니다.</p>
        </div>
      </div>
    </div>
  )
}