"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function SimpleSignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('회원가입 시도:', formData);
      
      const response = await fetch('/api/auth/simple-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('회원가입 응답:', data);

      if (response.ok) {
        setMessage('회원가입 성공! 로그인 페이지로 이동합니다...')
        setMessageType('success')
        
        // 성공 시 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/auth/simple-signin'
        }, 2000)
      } else {
        setMessage(data.error || '회원가입에 실패했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('회원가입 네트워크 오류:', error)
      
      // 더 자세한 에러 메시지
      if (error instanceof Error) {
        if (error.message.includes('SyntaxError') || error.message.includes('JSON')) {
          setMessage('서버 오류: API가 HTML을 반환했습니다. 환경변수 설정을 확인해주세요.')
        } else if (error.message.includes('Failed to fetch')) {
          setMessage('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
        } else {
          setMessage(`오류: ${error.message}`)
        }
      } else {
        setMessage('알 수 없는 오류가 발생했습니다.')
      }
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">W</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            WAgent
          </h2>
          <p className="mt-3 text-lg text-gray-600">새로운 디지털 여행을 시작하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-gray-800">계정 만들기</CardTitle>
            <p className="text-center text-gray-600 text-sm mt-2">정보를 입력하여 새 계정을 만드세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="성함을 입력하세요"
                  required
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">이메일 주소</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@wagent.com"
                  required
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="안전한 비밀번호를 입력하세요"
                  required
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">최소 6자 이상 입력해주세요</p>
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

              <div className="flex items-center text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required />
                  <span className="ml-2 text-gray-600">
                    <a href="#" className="text-blue-600 hover:text-blue-800">이용약관</a> 및 
                    <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">개인정보처리방침</a>에 동의합니다
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    계정 생성 중...
                  </div>
                ) : (
                  '계정 만들기'
                )}
              </Button>
            </form>

            {/* 로그인으로 이동 */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">이미 계정이 있으신가요? </span>
              <button
                onClick={() => router.push('/auth/simple-signin')}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                로그인하기
              </button>
            </div>

            {/* 소셜 회원가입 구분선 */}
            <div className="mt-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">또는</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* 소셜 회원가입 버튼들 */}
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
                disabled
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 가입하기 (준비 중)
              </Button>
            </div>

            {/* 혜택 안내 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                🎁 회원가입 혜택
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ 무료 자료 무제한 다운로드</li>
                <li>✓ 프리미엄 콘텐츠 할인 혜택</li>
                <li>✓ 개인화된 추천 서비스</li>
                <li>✓ 구매 내역 및 위시리스트 관리</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}