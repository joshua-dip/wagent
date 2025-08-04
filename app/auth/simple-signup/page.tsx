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
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">WAgent</h2>
          <p className="mt-2 text-gray-600">간단한 회원가입 (디버깅용)</p>
        </div>

        {/* 회원가입 폼 */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">회원가입</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="예: user@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="6자 이상"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 홍길동"
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
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    회원가입 중...
                  </div>
                ) : (
                  '회원가입'
                )}
              </Button>
            </form>

            {/* 특징 안내 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">🛠️ 간단한 회원가입 특징:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• 필수 정보만 입력 (이메일, 비밀번호, 이름)</li>
                <li>• 간단한 validation (복잡한 규칙 없음)</li>
                <li>• 빠른 처리 및 디버깅 로그</li>
              </ul>
            </div>

            {/* 로그인으로 이동 */}
            <div className="mt-4 text-center space-y-2">
              <div>
                <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
                <button
                  onClick={() => router.push('/auth/simple-signin')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  로그인
                </button>
              </div>
              <div>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  기존 회원가입 방식으로 돌아가기
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}