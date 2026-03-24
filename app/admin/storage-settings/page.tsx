"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Cloud,
  HardDrive,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Database,
  Upload,
  Download
} from 'lucide-react'

export default function StorageSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (!session) {
    router.push('/auth/admin-signin?next=/admin/storage-settings')
    return null
  }

  // 관리자가 아닌 경우
  if (session.user?.email !== 'wnsrb2898@naver.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">관리자 전용</h2>
            <p className="text-gray-600 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
            <Button onClick={() => router.push('/')} variant="outline">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const loadStorageInfo = async () => {
    // 실제로는 API에서 현재 저장소 설정 정보를 가져와야 함
    setStorageInfo({
      currentType: process.env.STORAGE_TYPE || 'local',
      s3Available: true, // AWS 설정 확인
      localPath: 'uploads/products/',
      s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'wagent-products'
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">저장소 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              관리자 대시보드
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">저장소 설정</h1>
          <p className="text-gray-600">파일 저장소 타입을 관리하고 마이그레이션하세요</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 현재 저장소 상태 */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                현재 저장소 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {storageInfo?.currentType === 's3' ? (
                    <Cloud className="w-8 h-8 text-blue-600" />
                  ) : (
                    <HardDrive className="w-8 h-8 text-gray-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {storageInfo?.currentType === 's3' ? 'AWS S3' : '로컬 저장소'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {storageInfo?.currentType === 's3' 
                        ? `버킷: ${storageInfo?.s3Bucket}` 
                        : `경로: ${storageInfo?.localPath}`
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  활성
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">업로드된 파일</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">456</div>
                  <div className="text-sm text-gray-600">총 다운로드</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 저장소 옵션 */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                저장소 옵션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 로컬 저장소 */}
              <div className={`p-4 border-2 rounded-lg ${
                storageInfo?.currentType === 'local' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold">로컬 저장소</h3>
                      <p className="text-sm text-gray-600">서버 디스크에 직접 저장</p>
                    </div>
                  </div>
                  {storageInfo?.currentType === 'local' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>✅ 빠른 업로드/다운로드</div>
                  <div>✅ 추가 비용 없음</div>
                  <div>❌ 서버 재시작시 손실 위험</div>
                  <div>❌ 확장성 제한</div>
                </div>
              </div>

              {/* AWS S3 */}
              <div className={`p-4 border-2 rounded-lg ${
                storageInfo?.currentType === 's3' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">AWS S3</h3>
                      <p className="text-sm text-gray-600">클라우드 안전 저장</p>
                    </div>
                  </div>
                  {storageInfo?.currentType === 's3' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>✅ 99.999999999% 내구성</div>
                  <div>✅ 무제한 확장성</div>
                  <div>✅ CDN 연동 가능</div>
                  <div>🔸 사용량별 과금</div>
                </div>
                
                {!storageInfo?.s3Available && (
                  <div className="mt-2 flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">AWS 설정 필요</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 마이그레이션 섹션 */}
        <Card className="mt-6 shadow-xl border-0">
          <CardHeader>
            <CardTitle>저장소 마이그레이션</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">마이그레이션 주의사항</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    • 마이그레이션 중에는 파일 업로드를 중단해주세요<br/>
                    • 기존 파일들의 백업을 먼저 진행하세요<br/>
                    • AWS S3 설정이 완료된 후 실행하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                disabled={storageInfo?.currentType === 's3' || !storageInfo?.s3Available}
                className="flex items-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                로컬 → S3 마이그레이션
              </Button>
              
              <Button 
                variant="outline"
                disabled={storageInfo?.currentType === 'local'}
                className="flex items-center gap-2"
              >
                <HardDrive className="w-4 h-4" />
                S3 → 로컬 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AWS 설정 가이드 */}
        <Card className="mt-6 shadow-xl border-0">
          <CardHeader>
            <CardTitle>AWS S3 설정 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <pre className="text-gray-700 whitespace-pre-wrap">
{`# .env.local에 추가할 환경변수:

AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=wagent-products
STORAGE_TYPE=s3

# IAM 사용자 생성 시 필요한 권한:
- s3:GetObject
- s3:PutObject  
- s3:DeleteObject`}
              </pre>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                AWS Console 열기
              </Button>
              <Button variant="outline" size="sm">
                설정 가이드 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}