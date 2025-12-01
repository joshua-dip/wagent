"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function SimpleSignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('로그인 성공! 리다이렉트 중...')
        setMessageType('success')
        
        // 로딩 상태 유지를 위해 setLoading을 false로 설정하지 않음
        
        // 로그인 성공 시 메인 페이지로 리다이렉트
        window.location.href = '/'
      } else {
        setMessage(data.error || '로그인에 실패했습니다.')
        setMessageType('error')
        setLoading(false) // 로그인 실패 시 로딩 해제
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setMessage('로그인 중 오류가 발생했습니다.')
      setMessageType('error')
      setLoading(false) // 에러 시 즉시 로딩 해제
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            PAYPERIC
          </h2>
          <p className="mt-3 text-lg text-gray-600">디지털 마켓플레이스에 오신 것을 환영합니다</p>
        </div>

        {/* 로그인 폼 */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-gray-800">계정에 로그인</CardTitle>
            <p className="text-center text-gray-600 text-sm mt-2">이메일과 비밀번호를 입력해주세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@wagent.com"
                  required
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                  <span className="ml-2 text-gray-600">로그인 상태 유지</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">
                  비밀번호 찾기
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    로그인 중...
                  </div>
                ) : (
                  '로그인하기'
                )}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">아직 계정이 없으신가요? </span>
              <button
                onClick={() => router.push('/auth/simple-signup')}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                회원가입하기
              </button>
            </div>

            {/* 소셜 로그인 구분선 */}
            <div className="mt-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">또는</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                onClick={() => {
                  const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'YOUR_KAKAO_CLIENT_ID'
                  const REDIRECT_URI = `${window.location.origin}/api/auth/kakao/callback`
                  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
                  window.location.href = kakaoAuthUrl
                }}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 border-0"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.9 2.012 5.44 5.008 6.866-.348 1.277-1.133 4.072-1.247 4.483 0 0-.077.308.161.425.238.117.442.018.442.018s5.126-4.37 5.948-5.07c.309.033.624.05.944.05 5.523 0 9.994-3.477 9.994-7.772C22 6.477 17.523 3 12 3z"/>
                </svg>
                카카오로 계속하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}