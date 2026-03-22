"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mail,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Lock,
} from "lucide-react"
import Link from "next/link"

type SignupMethod = "initial" | "email" | "verify"

export default function SimpleSignUpPage() {
  const router = useRouter()
  const [signupMethod, setSignupMethod] = useState<SignupMethod>("initial")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [savedEmail, setSavedEmail] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [countdown, setCountdown] = useState(600)
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (signupMethod !== "verify") {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      return
    }
    setCountdown(600)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [signupMethod])

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.name) {
      setMessage("모든 필드를 입력해주세요.")
      setMessageType("error")
      return
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      setMessage("이용약관 및 개인정보처리방침에 동의해주세요.")
      setMessageType("error")
      return
    }

    if (formData.password.length < 8) {
      setMessage("비밀번호는 최소 8자 이상이어야 합니다.")
      setMessageType("error")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/auth/simple-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          termsAgreed: agreedToTerms,
          privacyAgreed: agreedToPrivacy,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSavedEmail(formData.email)
        setVerificationCode("")
        setDevCodeHint(
          data.verificationCode
            ? String(data.verificationCode)
            : data.emailSent === false
              ? "dev-no-mail"
              : null
        )
        setSignupMethod("verify")
        setMessage(
          typeof data.message === "string" && data.message
            ? data.message
            : data.emailSent === false
              ? "메일 설정이 없어 개발 모드로 진행합니다. 아래 인증번호를 입력하세요."
              : "이메일로 인증번호를 보냈습니다. 메일함을 확인해 주세요."
        )
        setMessageType("success")
        if (data.verificationCode) {
          console.log("📧 인증번호:", data.verificationCode)
        }
      } else {
        setMessage(data.error || "회원가입에 실패했습니다.")
        setMessageType("error")
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.trim()
    if (!code || code.length < 6) {
      setMessage("6자리 인증번호를 입력해 주세요.")
      setMessageType("error")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedEmail, code }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message || "인증이 완료되었습니다.")
        setMessageType("success")
        setTimeout(() => router.push("/auth/simple-signin?verified=1"), 1500)
      } else {
        setMessage(data.error || "인증에 실패했습니다.")
        setMessageType("error")
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const stepIndex =
    signupMethod === "initial" ? 0 : signupMethod === "email" ? 1 : 2

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-teal-50/40"
        aria-hidden
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-72 bg-gradient-to-br from-teal-200/30 via-indigo-100/25 to-purple-100/30 blur-3xl rounded-full pointer-events-none"
        aria-hidden
      />

      <div className="relative w-full max-w-[420px] z-10">
        {/* 상단 브랜드 */}
        <header className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25 mb-4 ring-4 ring-white/80 hover:scale-[1.02] transition-transform"
            aria-label="PAYPERIC 홈"
          >
            <span className="text-2xl font-bold text-white tracking-tight">
              P
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            PAYPERIC
          </h1>
          <p className="text-sm text-teal-700 font-medium mt-1">
            서술형은 페이퍼릭
          </p>
          {signupMethod === "initial" && (
            <p className="text-slate-500 text-sm mt-2">
              고등 영어 서술형 자료를 한곳에서
            </p>
          )}
        </header>

        {/* 단계 표시 (이메일 가입 플로우) */}
        {signupMethod !== "initial" && (
          <div className="flex items-center justify-center gap-2 mb-5 text-xs font-medium">
            <span
              className={`px-2.5 py-1 rounded-full ${
                stepIndex >= 1
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              1 정보 입력
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full ${
                stepIndex >= 2
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2 이메일 인증
            </span>
          </div>
        )}

        <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2 pt-6 px-6 sm:px-8 text-center border-b border-slate-100/80 bg-gradient-to-b from-white to-slate-50/50">
            {signupMethod === "initial" && (
              <>
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    지금 가입하면
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
                    <span>이메일 인증 후 안전하게 로그인</span>
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
              </>
            )}
            {signupMethod === "email" && (
              <>
                <CardTitle className="text-xl font-bold text-slate-900">
                  이메일 회원가입
                </CardTitle>
                <p className="text-sm text-slate-500">
                  가입 후 메일로 온 <strong className="text-slate-700">6자리 숫자</strong>를
                  입력하면 완료돼요.
                </p>
              </>
            )}
            {signupMethod === "verify" && (
              <>
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6 text-teal-700" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  이메일 인증
                </CardTitle>
                <p className="text-sm text-slate-600 break-all px-1">
                  <span className="font-semibold text-slate-900">
                    {savedEmail}
                  </span>
                  <br />
                  <span className="text-slate-500">로 인증번호를 보냈어요.</span>
                </p>
              </>
            )}
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pt-6 pb-8">
            {signupMethod === "initial" && (
              <div className="space-y-3">
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
                  카카오로 3초 만에 가입
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-slate-400 font-medium">
                      또는
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setSignupMethod("email")}
                  type="button"
                  variant="outline"
                  className="w-full h-[52px] rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-800 font-semibold text-[15px] transition-all"
                >
                  <Mail className="w-5 h-5 mr-2 text-teal-600" />
                  이메일로 가입하기
                </Button>

                <p className="text-center text-sm text-slate-500 pt-4">
                  이미 계정이 있으신가요?{" "}
                  <Link
                    href="/auth/simple-signin"
                    className="text-teal-700 font-semibold hover:text-teal-800 underline-offset-2 hover:underline"
                  >
                    로그인
                  </Link>
                </p>
              </div>
            )}

            {signupMethod === "email" && (
              <form onSubmit={handleEmailSignup} className="space-y-5">
                <Button
                  onClick={() => {
                    setSignupMethod("initial")
                    setMessage("")
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  가입 방식 다시 선택
                </Button>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-700 text-sm font-medium">
                    이름
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500/30"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500/30"
                    autoComplete="email"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    6자리 인증번호가 이 주소로 발송됩니다.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 text-sm font-medium"
                  >
                    비밀번호
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8자 이상"
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-teal-500/30"
                    autoComplete="new-password"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    영문·숫자 조합 8자 이상을 권장합니다.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(c) => setAgreedToTerms(c as boolean)}
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-snug cursor-pointer">
                      <a
                        href="/terms"
                        className="text-teal-700 font-medium hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        이용약관
                      </a>
                      에 동의 (필수)
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={agreedToPrivacy}
                      onCheckedChange={(c) => setAgreedToPrivacy(c as boolean)}
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <label htmlFor="privacy" className="text-sm text-slate-600 leading-snug cursor-pointer">
                      <a
                        href="/privacy"
                        className="text-teal-700 font-medium hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        개인정보처리방침
                      </a>
                      에 동의 (필수)
                    </label>
                  </div>
                </div>

                {message && (
                  <div
                    className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${
                      messageType === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                        : "bg-red-50 text-red-800 border border-red-200/80"
                    }`}
                  >
                    {messageType === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-md shadow-teal-600/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      처리 중…
                    </span>
                  ) : (
                    "가입하고 인증 메일 받기"
                  )}
                </Button>
              </form>
            )}

            {signupMethod === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSignupMethod("email")
                    setMessage("")
                    setDevCodeHint(null)
                  }}
                  className="-ml-2 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  이메일·비밀번호 수정
                </Button>

                {devCodeHint && devCodeHint !== "dev-no-mail" && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 text-sm">
                    <p className="font-semibold text-amber-900 mb-1">
                      개발 환경 안내
                    </p>
                    <p className="text-xs text-amber-800/90 mb-2">
                      실제 메일 대신 아래 번호를 입력하세요.
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-[0.35em] text-center py-1">
                      {devCodeHint}
                    </p>
                  </div>
                )}

                {message && (
                  <div
                    className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${
                      messageType === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                        : "bg-red-50 text-red-800 border border-red-200/80"
                    }`}
                  >
                    {messageType === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="verifyCode"
                    className="text-slate-700 text-sm font-medium"
                  >
                    인증번호 6자리
                  </Label>
                  <Input
                    id="verifyCode"
                    name="verifyCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="• • • • • •"
                    className="h-14 rounded-xl border-slate-200 text-center text-2xl tracking-[0.4em] font-mono font-semibold focus-visible:ring-teal-500/30 placeholder:tracking-normal placeholder:text-slate-300"
                    aria-describedby="countdown-hint"
                  />
                  <p
                    id="countdown-hint"
                    className="text-xs text-slate-500 flex items-center justify-between gap-2"
                  >
                    <span>
                      남은 시간{" "}
                      <span
                        className={
                          countdown === 0
                            ? "text-red-600 font-bold"
                            : "text-teal-700 font-semibold tabular-nums"
                        }
                      >
                        {formatCountdown(countdown)}
                      </span>
                    </span>
                    {countdown === 0 && (
                      <span className="text-red-600">시간 만료 — 다시 가입해 주세요</span>
                    )}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || countdown === 0}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      확인 중…
                    </span>
                  ) : (
                    "인증 완료하고 가입 마치기"
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500 leading-relaxed">
                  메일이 보이지 않으면{" "}
                  <strong className="text-slate-600">스팸·프로모션함</strong>을
                  확인해 주세요.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-5">
          © PAYPERIC ·{" "}
          <Link href="/" className="underline-offset-2 hover:underline hover:text-slate-600">
            홈으로
          </Link>
        </p>
      </div>
    </div>
  )
}
