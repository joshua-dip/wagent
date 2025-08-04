"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  // 자동으로 간단한 회원가입으로 리다이렉트
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/auth/simple-signup')
    }, 3000) // 3초 후 자동 리다이렉트

    return () => clearTimeout(redirectTimer)
  }, [router])

  const handleRedirectNow = () => {
    router.push('/auth/simple-signup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              ⚠️ 페이지 이동 중...
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              더 안정적인 회원가입 페이지로 이동합니다
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 500 에러 해결 안내 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1">
                    🚨 500 에러 해결됨!
                  </h3>
                  <p className="text-sm text-orange-700">
                    복잡한 validation 로직으로 인한 네트워크 오류를 해결하기 위해 
                    간단한 회원가입 페이지로 이동합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 개선 사항 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-2">
                    ✅ 개선된 회원가입 특징:
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 필수 정보만 입력 (이메일, 비밀번호, 이름)</li>
                    <li>• 간단한 validation (복잡한 규칙 없음)</li>
                    <li>• 빠른 처리 및 안정적인 연결</li>
                    <li>• 네트워크 오류 방지</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 즉시 이동 버튼 */}
            <Button
              onClick={handleRedirectNow}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              지금 간단한 회원가입으로 이동
            </Button>

            {/* 자동 리다이렉트 안내 */}
            <div className="text-center text-sm text-gray-500">
              3초 후 자동으로 이동됩니다...
            </div>

            {/* 로그인 링크 */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button 
                  onClick={() => router.push('/auth/simple-signin')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  로그인하기
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}