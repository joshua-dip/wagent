"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signupSchema, SignupFormData } from '@/utils/signupValidation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      marketingAgreed: false,
      termsAgreed: false,
      privacyAgreed: false
    }
  })

  const watchedEmail = watch('email')
  const watchedPassword = watch('password')

  // 이메일 중복 체크
  const checkEmailAvailability = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailCheckStatus('idle')
      return
    }

    setEmailCheckStatus('checking')
    
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setEmailCheckStatus(data.available ? 'available' : 'taken')
    } catch (error) {
      setEmailCheckStatus('idle')
    }
  }

  // 비밀번호 강도 체크
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: '매우 약함', color: 'bg-red-500' },
      { score: 2, label: '약함', color: 'bg-orange-500' },
      { score: 3, label: '보통', color: 'bg-yellow-500' },
      { score: 4, label: '강함', color: 'bg-blue-500' },
      { score: 5, label: '매우 강함', color: 'bg-green-500' }
    ]
    
    return levels[score] || levels[0]
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '')

  // 폼 제출
  const onSubmit = async (data: SignupFormData) => {
    if (emailCheckStatus === 'taken') {
      setSubmitError('사용할 수 없는 이메일입니다')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
        router.push('/auth/signin?message=signup-success')
      } else {
        setSubmitError(result.error || '회원가입 중 오류가 발생했습니다')
      }
    } catch (error) {
      setSubmitError('네트워크 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WAgent 회원가입
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              프리미엄 디지털 마켓플레이스에 오신 것을 환영합니다
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 이메일 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...register('email')}
                    className={`pr-10 ${
                      errors.email ? 'border-red-500' : 
                      emailCheckStatus === 'available' ? 'border-green-500' :
                      emailCheckStatus === 'taken' ? 'border-red-500' : ''
                    }`}
                    onBlur={(e) => checkEmailAvailability(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailCheckStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    {emailCheckStatus === 'available' && <Check className="w-4 h-4 text-green-500" />}
                    {emailCheckStatus === 'taken' && <X className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                {emailCheckStatus === 'taken' && <p className="text-red-500 text-sm">이미 사용 중인 이메일입니다</p>}
                {emailCheckStatus === 'available' && <p className="text-green-500 text-sm">사용 가능한 이메일입니다</p>}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {watchedPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded">
                        <div 
                          className={`h-full rounded transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력해주세요"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              {/* 이름 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="홍길동"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              {/* 닉네임 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">닉네임 (선택)</label>
                <Input
                  type="text"
                  placeholder="사용할 닉네임을 입력해주세요"
                  {...register('nickname')}
                />
              </div>

              {/* 휴대폰 번호 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  휴대폰 번호 (선택)
                </label>
                <Input
                  type="tel"
                  placeholder="010-1234-5678"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              {/* 생년월일 & 성별 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    생년월일 (선택)
                  </label>
                  <Input
                    type="date"
                    {...register('birthDate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">성별 (선택)</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="other">기타</option>
                  </select>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...register('termsAgreed')}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 
                      <Link href="/terms" className="text-blue-600 hover:underline ml-1">
                        이용약관
                      </Link>에 동의합니다
                    </label>
                  </div>
                  {errors.termsAgreed && <p className="text-red-500 text-sm ml-7">{errors.termsAgreed.message}</p>}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...register('privacyAgreed')}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      <span className="text-red-500">*</span>
                      <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                        개인정보처리방침
                      </Link>에 동의합니다
                    </label>
                  </div>
                  {errors.privacyAgreed && <p className="text-red-500 text-sm ml-7">{errors.privacyAgreed.message}</p>}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...register('marketingAgreed')}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </label>
                  </div>
                </div>
              </div>

              {/* 에러 메시지 */}
              {submitError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{submitError}</span>
                </div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isSubmitting || emailCheckStatus === 'taken'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    회원가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
                  로그인하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}