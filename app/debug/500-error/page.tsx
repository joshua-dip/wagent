"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Play,
  RefreshCw
} from 'lucide-react'

interface TestResult {
  level: number
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  data?: any
  duration?: number
}

export default function Error500DiagnosticPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const tests = [
    { level: 1, name: "기본 API", description: "Next.js 기본 기능" },
    { level: 2, name: "환경변수", description: "환경변수 접근" },
    { level: 3, name: "MongoDB Import", description: "MongoDB 모듈 import" },
    { level: 4, name: "MongoDB 연결", description: "MongoDB 연결 시도" },
    { level: 5, name: "User 모델", description: "User 모델 접근" }
  ]

  const runSingleTest = async (level: number) => {
    const testIndex = testResults.findIndex(t => t.level === level)
    if (testIndex >= 0) {
      const newResults = [...testResults]
      newResults[testIndex] = { ...newResults[testIndex], status: 'running' }
      setTestResults(newResults)
    }

    try {
      const startTime = Date.now()
      const response = await fetch(`/api/test-level-${level}`)
      const data = await response.json()
      const duration = Date.now() - startTime

      const result: TestResult = {
        level,
        status: response.ok ? 'success' : 'error',
        message: data.message || `레벨 ${level} ${response.ok ? '성공' : '실패'}`,
        data,
        duration
      }

      if (testIndex >= 0) {
        const newResults = [...testResults]
        newResults[testIndex] = result
        setTestResults(newResults)
      } else {
        setTestResults(prev => [...prev, result])
      }

    } catch (error) {
      const result: TestResult = {
        level,
        status: 'error',
        message: `레벨 ${level} 네트워크 오류: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { networkError: true, error: error.message }
      }

      if (testIndex >= 0) {
        const newResults = [...testResults]
        newResults[testIndex] = result
        setTestResults(newResults)
      } else {
        setTestResults(prev => [...prev, result])
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults(tests.map(test => ({
      level: test.level,
      status: 'pending' as const,
      message: '대기 중...'
    })))

    for (const test of tests) {
      await runSingleTest(test.level)
      
      // 만약 이 레벨에서 실패하면 다음 레벨들은 스킵
      const currentResult = testResults.find(r => r.level === test.level)
      if (currentResult?.status === 'error') {
        const remainingTests = tests.filter(t => t.level > test.level)
        for (const remainingTest of remainingTests) {
          setTestResults(prev => prev.map(r => 
            r.level === remainingTest.level 
              ? { ...r, status: 'error' as const, message: `레벨 ${test.level} 실패로 인해 건너뜀` }
              : r
          ))
        }
        break
      }
    }

    setIsRunning(false)
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">500 에러 진단</h1>
          <p className="text-gray-600">단계별로 테스트하여 정확한 오류 원인을 찾습니다</p>
        </div>

        {/* 전체 테스트 실행 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              단계별 진단 시작
            </CardTitle>
            <CardDescription>
              레벨 1부터 5까지 순차적으로 테스트하여 어느 단계에서 오류가 발생하는지 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {isRunning ? (
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

        {/* 개별 테스트 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {tests.map((test) => {
            const result = testResults.find(r => r.level === test.level)
            return (
              <Card key={test.level} className="text-center">
                <CardContent className="p-4">
                  <div className="flex justify-center mb-2">
                    {result ? getStatusIcon(result.status) : <AlertTriangle className="w-5 h-5 text-gray-400" />}
                  </div>
                  <h3 className="font-medium mb-1">레벨 {test.level}</h3>
                  <p className="text-sm text-gray-600 mb-2">{test.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{test.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runSingleTest(test.level)}
                    disabled={isRunning}
                    className="w-full"
                  >
                    개별 테스트
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 테스트 결과 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>진단 결과</CardTitle>
              <CardDescription>
                각 레벨별 테스트 결과를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => {
                  const test = tests.find(t => t.level === result.level)
                  return (
                    <div key={result.level} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            레벨 {result.level}: {test?.name}
                          </h3>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          {result.duration && (
                            <p className="text-xs text-gray-500">소요시간: {result.duration}ms</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 상세 결과 */}
              <div className="mt-6 space-y-4">
                {testResults.map((result) => (
                  result.data && (
                    <details key={`detail-${result.level}`} className="bg-gray-50 rounded-lg p-4">
                      <summary className="cursor-pointer font-medium text-gray-700">
                        레벨 {result.level} 상세 정보
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 빠른 링크 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {tests.map((test) => (
            <Card key={`link-${test.level}`}>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium mb-1">레벨 {test.level}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/api/test-level-${test.level}`, '_blank')}
                  className="w-full"
                >
                  직접 확인
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}