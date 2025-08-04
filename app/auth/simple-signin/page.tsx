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
        
        // 역할별 리다이렉트 (즉시 실행)
        if (data.user.role === 'admin') {
          window.location.href = '/simple-dashboard'
        } else {
          window.location.href = '/' // 일반 사용자는 메인 페이지로
        }
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">WAgent</h2>
          <p className="mt-2 text-gray-600">간단한 로그인 (디버깅용)</p>
        </div>

        {/* 로그인 폼 */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wnsbr2898@naver.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  required
                  className="mt-1"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    로그인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>

            {/* 테스트 계정 안내 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">🧪 테스트 계정:</p>
              <p className="text-sm text-blue-600">
                이메일: wnsbr2898@naver.com<br />
                비밀번호: 123456
              </p>
            </div>

            {/* 회원가입 및 기존 로그인 링크 */}
            <div className="mt-4 text-center space-y-2">
              <div>
                <span className="text-sm text-gray-600">계정이 없으신가요? </span>
                <button
                  onClick={() => router.push('/auth/simple-signup')}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  간단한 회원가입
                </button>
                <span className="text-gray-400 mx-2">|</span>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  기존 회원가입
                </button>
              </div>
              <div>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  기존 로그인 방식으로 돌아가기
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}