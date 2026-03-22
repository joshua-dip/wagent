"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SimpleSignInPage() {
  const router = useRouter()

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID =
      process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "YOUR_KAKAO_CLIENT_ID"
    const REDIRECT_URI = `${window.location.origin}/api/auth/kakao/callback`
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`
    window.location.href = kakaoAuthUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            PAYPERIC
          </h2>
          <p className="mt-3 text-lg text-gray-600">디지털 마켓플레이스에 오신 것을 환영합니다</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              로그인
            </CardTitle>
            <p className="text-center text-gray-600 text-sm mt-2">
              카카오 계정으로 로그인해 주세요
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              onClick={handleKakaoLogin}
              className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 border-0 font-semibold"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.9 2.012 5.44 5.008 6.866-.348 1.277-1.133 4.072-1.247 4.483 0 0-.077.308.161.425.238.117.442.018.442.018s5.126-4.37 5.948-5.07c.309.033.624.05.944.05 5.523 0 9.994-3.477 9.994-7.772C22 6.477 17.523 3 12 3z" />
              </svg>
              카카오로 계속하기
            </Button>

            <p className="text-center text-sm text-gray-600">
              아직 계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/simple-signup")}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                카카오 가입
              </button>
            </p>

            <p className="text-center text-xs text-gray-400">
              <Link href="/" className="hover:text-gray-600 underline-offset-2 hover:underline">
                홈으로 돌아가기
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
