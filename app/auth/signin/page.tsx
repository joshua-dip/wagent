'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInRedirect() {
  const router = useRouter()

  useEffect(() => {
    // 기본 로그인 페이지는 간단한 로그인으로 리다이렉트
    router.replace('/auth/simple-signin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}