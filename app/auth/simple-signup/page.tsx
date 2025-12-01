"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type SignupMethod = 'initial' | 'email' | 'verify'

export default function SimpleSignUpPage() {
  const router = useRouter()
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('initial')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [countdown, setCountdown] = useState(600) // 10분 = 600초

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // 카카오 회원가입
  const handleKakaoSignup = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'YOUR_KAKAO_CLIENT_ID'
    const REDIRECT_URI = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/auth/kakao/callback`
      : ''
    
    console.log('카카오 회원가입 Redirect URI:', REDIRECT_URI) // 디버깅용
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`
    
    window.location.href = kakaoAuthUrl
  }

  // 이메일 회원가입
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.name) {
      setMessage('모든 필드를 입력해주세요.')
      setMessageType('error')
      return
    }

    if (!agreedToTerms || !agreedToPrivacy) {
      setMessage('이용약관 및 개인정보처리방침에 동의해주세요.')
      setMessageType('error')
      return
    }

    if (formData.password.length < 8) {
      setMessage('비밀번호는 최소 8자 이상이어야 합니다.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/simple-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          termsAgreed: agreedToTerms,
          privacyAgreed: agreedToPrivacy
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSavedEmail(formData.email)
        setSignupMethod('verify')
        setMessage('')
        setMessageType('success')
        
        // 카운트다운 시작
        setCountdown(600)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        // 개발 환경에서는 인증번호 표시
        if (data.verificationCode) {
          console.log('📧 인증번호:', data.verificationCode)
          alert(`인증번호: ${data.verificationCode}\n\n실제 운영에서는 이메일로 발송됩니다.`)
        }
      } else {
        setMessage(data.error || '회원가입에 실패했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('서버 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl font-bold text-white">🅿️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PAYPERIC
          </h1>
          <p className="text-2xl font-semibold text-blue-600 mb-1">
            회원가입
          </p>
          <p className="text-lg text-gray-600">
            영어 서술형 자료의 모든 것
          </p>
        </div>

        {/* 회원가입 폼 */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4 text-center">
            {signupMethod === 'initial' && (
              <>
                <div className="mb-3">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                    지금 가입하면
                  </span>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                  프리미엄 서술형 자료를 만나보세요! 📝
                </CardTitle>
                <p className="text-gray-600">
                  고품질 영어 서술형 자료를 간편하게 구매하고 활용하세요
                </p>
              </>
            )}
            {signupMethod === 'email' && (
              <CardTitle className="text-2xl font-bold text-gray-800">
                이메일로 가입하기
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {/* 초기 화면 - 가입 방법 선택 */}
            {signupMethod === 'initial' && (
              <div className="space-y-4">
                {/* 카카오 가입 */}
                <Button
                  onClick={handleKakaoSignup}
                  type="button"
                  className="w-full h-14 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 font-semibold text-base shadow-md transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5 mr-3" fill="currentColor" />
                  카카오로 3초만에 가입하기
                </Button>

                {/* 구분선 */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                {/* 이메일 가입 */}
                <Button
                  onClick={() => setSignupMethod('email')}
                  type="button"
                  variant="outline"
                  className="w-full h-14 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 font-semibold text-base transition-all duration-200"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  이메일로 가입하기
                </Button>

                {/* 로그인 링크 */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/auth/simple-signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                      로그인
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* 이메일 회원가입 폼 */}
            {signupMethod === 'email' && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <Button
                  onClick={() => setSignupMethod('initial')}
                  type="button"
                  variant="ghost"
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>

                {/* 이름 */}
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">이름</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="mt-2 h-12"
                    required
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">이메일</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@payperic.com"
                    className="mt-2 h-12"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    이메일로 인증 링크가 발송됩니다
                  </p>
                </div>

                {/* 비밀번호 */}
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium">비밀번호</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="안전한 비밀번호를 입력하세요"
                    className="mt-2 h-12"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    최소 8자 이상 입력해주세요
                  </p>
                </div>

                {/* 약관 동의 */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                        이용약관
                      </a>에 동의합니다 (필수)
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={agreedToPrivacy}
                      onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                      <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                        개인정보처리방침
                      </a>에 동의합니다 (필수)
                    </label>
                  </div>
                </div>

                {/* 메시지 표시 */}
                {message && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    messageType === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {messageType === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                {/* 가입하기 버튼 */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      가입 중...
                    </div>
                  ) : (
                    '가입하기'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 하단 텍스트 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          간편하게 가입하고 영어 서술형 자료를 바로 받아보세요
        </p>
      </div>
    </div>
  )
}
