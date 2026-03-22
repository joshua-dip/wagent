"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle2, BookOpen, Lock, Sparkles } from "lucide-react"

export default function SimpleSignUpPage() {
  const handleKakaoSignup = () => {
    const KAKAO_CLIENT_ID =
      process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "YOUR_KAKAO_CLIENT_ID"
    const REDIRECT_URI =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/auth/kakao/callback`
        : ""
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`
    window.location.href = kakaoAuthUrl
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-teal-50/40"
        aria-hidden
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-72 bg-gradient-to-br from-teal-200/30 via-indigo-100/25 to-purple-100/30 blur-3xl rounded-full pointer-events-none"
        aria-hidden
      />

      <div className="relative w-full max-w-[420px] z-10">
        <header className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25 mb-4 ring-4 ring-white/80 hover:scale-[1.02] transition-transform"
            aria-label="PAYPERIC 홈"
          >
            <span className="text-2xl font-bold text-white tracking-tight">P</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            PAYPERIC
          </h1>
          <p className="text-sm text-teal-700 font-medium mt-1">서술형은 페이퍼릭</p>
          <p className="text-slate-500 text-sm mt-2">고등 영어 서술형 자료를 한곳에서</p>
        </header>

        <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2 pt-6 px-6 sm:px-8 text-center border-b border-slate-100/80 bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                카카오로 간편 가입
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              프리미엄 서술형 자료를
              <br />
              바로 만나보세요
            </CardTitle>
            <p className="text-sm text-slate-600 pt-2 max-w-sm mx-auto">
              검증된 기출 기반 자료를 구매 후 즉시 다운로드할 수 있어요.
            </p>
            <ul className="text-left text-sm text-slate-600 space-y-2 pt-4 max-w-xs mx-auto">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>카카오 계정으로 안전하게 시작</span>
              </li>
              <li className="flex gap-2 items-start">
                <BookOpen className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>교사 맞춤 서술형 자료 구매</span>
              </li>
              <li className="flex gap-2 items-start">
                <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>결제·다운로드 내역 관리</span>
              </li>
            </ul>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pt-6 pb-8 space-y-4">
            <Button
              onClick={handleKakaoSignup}
              type="button"
              className="w-full h-[52px] rounded-xl bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] font-semibold text-[15px] shadow-sm border border-[#F0D000]/50 transition-all hover:shadow-md active:scale-[0.99]"
            >
              <MessageCircle
                className="w-[22px] h-[22px] mr-2.5"
                fill="currentColor"
                strokeWidth={0}
              />
              카카오로 시작하기
            </Button>

            <p className="text-xs text-slate-500 text-center leading-relaxed px-1">
              카카오로 계속하면{" "}
              <a
                href="/terms"
                className="text-teal-700 font-medium hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                이용약관
              </a>
              ·
              <a
                href="/privacy"
                className="text-teal-700 font-medium hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                개인정보처리방침
              </a>
              에 동의하는 것으로 처리됩니다.
            </p>

            <p className="text-center text-sm text-slate-500 pt-2">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/auth/simple-signin"
                className="text-teal-700 font-semibold hover:text-teal-800 underline-offset-2 hover:underline"
              >
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-5">
          © PAYPERIC ·{" "}
          <Link
            href="/"
            className="underline-offset-2 hover:underline hover:text-slate-600"
          >
            홈으로
          </Link>
        </p>
      </div>
    </div>
  )
}
