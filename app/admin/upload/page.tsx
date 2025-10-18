"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Layout from '@/components/Layout'
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Tag, 
  User,
  AlertCircle,
  CheckCircle2,
  Gift
} from 'lucide-react'

// 기본 폼 스키마
const baseProductSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이내로 입력해주세요"),
  description: z.string().min(10, "설명은 최소 10자 이상 입력해주세요").max(2000, "설명은 2000자 이내로 입력해주세요"),
  price: z.number().min(0, "가격은 0원 이상이어야 합니다"),
  originalPrice: z.number().optional(),
  category: z.enum([
    'original-translation', 'lecture-material', 'class-material', 'line-translation', 
    'english-writing', 'translation-writing', 'workbook-blanks', 'order-questions', 
    'insertion-questions', 'ebs-lecture', 'ebs-workbook', 'ebs-test', 
    'reading-comprehension', 'reading-strategy', 'reading-test', 
    'grade1-material', 'grade2-material', 'grade3-material'
  ]),
  tags: z.string().optional(),
  author: z.string().optional(), // 작성자 필드를 선택사항으로 변경
  isFree: z.boolean().default(false), // 무료 상품 옵션 추가
  pdfFile: z.any().refine((files) => files?.length > 0, "PDF 파일을 선택해주세요")
})

// 조건부 가격 검증을 위한 refined 스키마
const productSchema = baseProductSchema.refine(
  (data) => {
    // 무료 상품이 아닌 경우에만 가격이 0보다 커야 함
    if (!data.isFree && data.price <= 0) {
      return false;
    }
    return true;
  },
  {
    message: "유료 상품은 가격을 0원보다 크게 설정해주세요",
    path: ["price"], // 에러가 price 필드에 표시되도록
  }
)

type ProductFormData = z.infer<typeof productSchema>

// 메인 카테고리
const mainCategories = [
  { value: '2025-english-mock', label: '2025 영어모의고사' },
  { value: 'ebs-special', label: 'EBS수능특강영어' },
  { value: 'ebs-reading', label: 'EBS수능특강영어독해' },
  { value: 'supplementary', label: '부교재자료' }
]

// 하위 카테고리 (2025 영어모의고사용)
const subCategories = {
  '2025-english-mock': [
    { value: 'shared-materials', label: '공유자료 (무료)' },
    { value: 'workbook-blanks', label: '워크북 빈칸쓰기 패키지' },
    { value: 'order-questions', label: '변형문제_글의순서 4회분' },
    { value: 'insertion-questions', label: '변형문제_문장삽입 4회분' }
  ],
  'ebs-special': [
    { value: 'ebs-lecture', label: '강의 자료' },
    { value: 'ebs-workbook', label: '워크북' },
    { value: 'ebs-test', label: '평가 문제' }
  ],
  'ebs-reading': [
    { value: 'reading-comprehension', label: '독해 연습' },
    { value: 'reading-strategy', label: '독해 전략' },
    { value: 'reading-test', label: '독해 평가' }
  ],
  'supplementary': [
    { value: 'grade1-material', label: '고1 부교재' },
    { value: 'grade2-material', label: '고2 부교재' },
    { value: 'grade3-material', label: '고3 부교재' }
  ]
}

export default function AdminUploadPage() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('')
  
  // 두 인증 시스템 중 하나라도 로그인되어 있으면 인증된 것으로 처리
  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  
  // 관리자인지 확인 (두 시스템 모두 체크)
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || 
                  simpleAuth.user?.role === 'admin'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema.omit({ pdfFile: true })), // 파일은 별도 처리
    defaultValues: {
      price: 0,
      isFree: false
    }
  })

  // 무료 상품 체크 시 가격을 자동으로 0으로 설정
  const watchIsFree = watch('isFree')
  const watchCategory = watch('category')
  
  useEffect(() => {
    if (watchIsFree) {
      setValue('price', 0)
      setValue('originalPrice', undefined)
    }
  }, [watchIsFree, setValue])

  // 공유자료 카테고리 선택 시 자동으로 무료로 설정
  useEffect(() => {
    if (watchCategory === 'shared-materials') {
      setValue('isFree', true)
      setValue('price', 0)
      setValue('originalPrice', undefined)
    }
  }, [watchCategory, setValue])

  // 로딩 중이면 로딩 표시
  if (status === 'loading' || simpleAuth.isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </Layout>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    router.push('/auth/simple-signin')
    return null
  }

  // 관리자가 아닌 경우
  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
              <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
              <Button onClick={() => router.push('/')} variant="outline">
                홈으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.')
        e.target.value = ''
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('파일 크기는 50MB를 초과할 수 없습니다.')
        e.target.value = ''
        return
      }
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data: Omit<ProductFormData, 'pdfFile'>) => {
    if (!selectedFile) {
      alert('PDF 파일을 선택해주세요.')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', data.title)
      formData.append('description', data.description)
      
      // 무료 상품인 경우 가격을 0으로 설정
      const finalPrice = data.isFree ? 0 : data.price
      formData.append('price', finalPrice.toString())
      
      if (data.originalPrice && !data.isFree) {
        formData.append('originalPrice', data.originalPrice.toString())
      }
      formData.append('category', data.category)
      formData.append('tags', data.tags || '')
      
      // 작성자가 없으면 기본값 설정
      const finalAuthor = data.author?.trim() || 'PAYPERIC'
      formData.append('author', finalAuthor)

      // 통합 업로드 API 사용 (환경에 따라 로컬 또는 S3)
      const response = await fetch('/api/products/upload-unified', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadSuccess(true)
        reset()
        setSelectedFile(null)
        // 파일 input 초기화
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      } else {
        alert(result.error || '업로드 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('업로드 오류:', error)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-3 sm:-m-6 min-h-full py-8 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 업로드</h1>
          <p className="text-gray-600">새로운 PDF 상품을 업로드하고 판매하세요</p>
        </div>

        {uploadSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">상품이 성공적으로 업로드되었습니다!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              새 상품 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 파일 업로드 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  PDF 파일 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="pdfFile" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="text-green-600">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p>PDF 파일을 선택하거나 드래그하세요</p>
                        <p className="text-sm">최대 50MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('title')}
                  placeholder="상품 제목을 입력하세요"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>

              {/* 설명 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  설명 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>

              {/* 가격 정보 */}
              <div className="space-y-4">
                {/* 무료 상품 옵션 */}
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <input
                    {...register('isFree')}
                    type="checkbox"
                    id="isFree"
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    무료 상품으로 제공
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      판매가격 (원) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={watch('isFree')}
                      className={`${errors.price ? 'border-red-500' : ''} ${watch('isFree') ? 'bg-gray-100' : ''}`}
                    />
                    {watch('isFree') && <p className="text-sm text-gray-500">무료 상품은 가격이 0원으로 설정됩니다.</p>}
                    {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      정가 (원) - 선택사항
                    </label>
                    <Input
                      {...register('originalPrice', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="할인 전 가격"
                      disabled={watch('isFree')}
                      className={watch('isFree') ? 'bg-gray-100' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* 카테고리 및 작성자 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    메인 카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                      setSelectedMainCategory(e.target.value)
                      setValue('category', '') // 하위 카테고리 초기화
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">메인 카테고리 선택</option>
                    {mainCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    세부 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    disabled={!selectedMainCategory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedMainCategory ? '세부 유형 선택' : '먼저 메인 카테고리를 선택하세요'}
                    </option>
                    {selectedMainCategory && subCategories[selectedMainCategory as keyof typeof subCategories]?.map(subCat => (
                      <option key={subCat.value} value={subCat.value}>{subCat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                </div>
              </div>

              {/* 작성자 */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    작성자 (선택사항)
                  </label>
                  <Input
                    {...register('author')}
                    placeholder="작성자명을 입력하세요 (선택사항)"
                  />
                  <p className="text-sm text-gray-500">작성자명을 입력하지 않으면 'PAYPERIC'로 설정됩니다.</p>
                </div>
              </div>

              {/* 태그 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  태그 (선택사항)
                </label>
                <Input
                  {...register('tags')}
                  placeholder="태그를 쉼표(,)로 구분하여 입력하세요. 예: React, JavaScript, 튜토리얼"
                />
                <p className="text-sm text-gray-500">검색에 도움이 되는 키워드를 입력하세요</p>
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    업로드 중...
                  </div>
                ) : (
                  '상품 업로드'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}