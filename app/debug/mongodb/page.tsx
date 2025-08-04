"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Server,
  Users,
  TestTube,
  RefreshCw
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  details?: any
  duration?: number
}

export default function MongoDBDebugPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testEmail, setTestEmail] = useState('debug-test@example.com')

  const updateTestResult = (index: number, result: Partial<TestResult>) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, ...result } : test
    ))
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    
    const tests: TestResult[] = [
      { name: 'API 기본 연결', status: 'pending', message: '대기 중...' },
      { name: 'MongoDB 연결', status: 'pending', message: '대기 중...' },
      { name: 'User 모델 읽기', status: 'pending', message: '대기 중...' },
      { name: 'User 모델 쓰기', status: 'pending', message: '대기 중...' },
      { name: '회원가입 API', status: 'pending', message: '대기 중...' },
      { name: '이메일 중복체크', status: 'pending', message: '대기 중...' }
    ]
    
    setTestResults(tests)

    // 1. API 기본 연결 테스트
    try {
      updateTestResult(0, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/test-simple')
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(0, {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? '기본 API 연결 성공' : '기본 API 연결 실패',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(0, {
        status: 'error',
        message: '기본 API 연결 실패',
        details: error.message
      })
    }

    // 2. MongoDB 연결 테스트
    try {
      updateTestResult(1, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/debug/mongodb-connection')
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(1, {
        status: response.ok ? 'success' : 'error',
        message: data.message || 'MongoDB 연결 테스트 완료',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(1, {
        status: 'error',
        message: 'MongoDB 연결 테스트 실패',
        details: error.message
      })
    }

    // 3. User 모델 읽기 테스트
    try {
      updateTestResult(2, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/debug/user-read')
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(2, {
        status: response.ok ? 'success' : 'error',
        message: data.message || 'User 모델 읽기 완료',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(2, {
        status: 'error',
        message: 'User 모델 읽기 실패',
        details: error.message
      })
    }

    // 4. User 모델 쓰기 테스트
    try {
      updateTestResult(3, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/debug/user-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `debug-${Date.now()}@test.com`,
          name: 'Debug Test User'
        })
      })
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(3, {
        status: response.ok ? 'success' : 'error',
        message: data.message || 'User 모델 쓰기 완료',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(3, {
        status: 'error',
        message: 'User 모델 쓰기 실패',
        details: error.message
      })
    }

    // 5. 회원가입 API 테스트
    try {
      updateTestResult(4, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/auth/simple-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: '123456',
          name: 'Debug Test'
        })
      })
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(4, {
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || '회원가입 API 테스트 완료',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(4, {
        status: 'error',
        message: '회원가입 API 테스트 실패',
        details: error.message
      })
    }

    // 6. 이메일 중복체크 테스트
    try {
      updateTestResult(5, { status: 'running', message: '테스트 중...' })
      const startTime = Date.now()
      
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })
      const data = await response.json()
      const duration = Date.now() - startTime
      
      updateTestResult(5, {
        status: response.ok ? 'success' : 'error',
        message: data.message || '이메일 중복체크 완료',
        details: data,
        duration
      })
    } catch (error) {
      updateTestResult(5, {
        status: 'error',
        message: '이메일 중복체크 실패',
        details: error.message
      })
    }

    setIsRunningTests(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">성공</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">실패</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">실행 중</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600">대기</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MongoDB 연결 진단</h1>
          <p className="text-gray-600">배포된 환경에서 MongoDB 연결 상태를 실시간으로 확인합니다</p>
        </div>

        {/* 테스트 설정 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              테스트 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">테스트용 이메일</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="테스트에 사용할 이메일을 입력하세요"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  진단 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  전체 진단 시작
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 테스트 결과 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                진단 결과
              </CardTitle>
              <CardDescription>
                각 단계별 MongoDB 연결 상태를 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.message}</p>
                        {test.duration && (
                          <p className="text-xs text-gray-500">소요시간: {test.duration}ms</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                ))}
              </div>

              {/* 상세 결과 */}
              <div className="mt-6 space-y-4">
                {testResults.map((test, index) => (
                  test.details && (
                    <details key={index} className="bg-gray-50 rounded-lg p-4">
                      <summary className="cursor-pointer font-medium text-gray-700">
                        {test.name} 상세 정보
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 빠른 링크 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium mb-1">MongoDB 연결</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/debug/mongodb-connection', '_blank')}
              >
                직접 확인
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium mb-1">User 모델</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/debug/user-read', '_blank')}
              >
                직접 확인
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Server className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium mb-1">시스템 상태</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/health', '_blank')}
              >
                직접 확인
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}