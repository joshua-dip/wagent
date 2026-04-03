"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Ban,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  Shield
} from "lucide-react"

interface User {
  _id: string
  email: string
  name: string
  signupMethod: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  purchaseCount: number
  totalSpent: number
  lastLogin?: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const simpleAuth = useSimpleAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    action: 'deactivate' | 'activate' | 'delete'
    userId: string
    userName: string
  } | null>(null)

  const currentUser = simpleAuth.user || session?.user
  const isAuthenticated = simpleAuth.isAuthenticated || !!session
  const isAdmin = currentUser?.email === "wnsrb2898@naver.com" || simpleAuth.user?.role === 'admin'

  useEffect(() => {
    if (simpleAuth.isLoading || status === 'loading') return

    if (!isAuthenticated) {
      router.push('/auth/admin-signin?next=/admin/users')
      return
    }
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [isAdmin, isAuthenticated, router, simpleAuth.isLoading, status])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error('사용자 목록 로드 실패:', data.error)
      }
    } catch (error) {
      console.error('사용자 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 상태 필터
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.isActive)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.isActive)
    }

    setFilteredUsers(filtered)
  }

  const handleDeactivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PATCH'
      })

      if (response.ok) {
        fetchUsers()
        setConfirmDialog(null)
      } else {
        const data = await response.json()
        alert(data.error || '비활성화 실패')
      }
    } catch (error) {
      console.error('비활성화 오류:', error)
      alert('비활성화 처리 중 오류가 발생했습니다.')
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'PATCH'
      })

      if (response.ok) {
        fetchUsers()
        setConfirmDialog(null)
      } else {
        const data = await response.json()
        alert(data.error || '활성화 실패')
      }
    } catch (error) {
      console.error('활성화 오류:', error)
      alert('활성화 처리 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers()
        setConfirmDialog(null)
      } else {
        const data = await response.json()
        alert(data.error || '삭제 실패')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 처리 중 오류가 발생했습니다.')
    }
  }

  if (simpleAuth.isLoading || status === 'loading' || !isAuthenticated || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-4" />
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-4" />
            <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    verified: users.filter(u => u.emailVerified).length
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-gray-500 mt-1">전체 사용자 계정을 관리합니다</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">비활성 사용자</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이메일 인증</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.verified}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="이메일 또는 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  className="gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  활성
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                  className="gap-2"
                >
                  <UserX className="h-4 w-4" />
                  비활성
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>
              사용자 목록 ({filteredUsers.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-12">사용자가 없습니다</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        user.isActive ? 'bg-emerald-100' : 'bg-gray-300'
                      }`}>
                        <Users className={`h-6 w-6 ${
                          user.isActive ? 'text-emerald-600' : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          {!user.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              비활성
                            </Badge>
                          )}
                          {user.email === "wnsrb2898@naver.com" && (
                            <Badge className="text-xs bg-teal-600">
                              <Shield className="h-3 w-3 mr-1" />
                              관리자
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {user.signupMethod === 'kakao' ? '카카오' : '이메일'}
                          </Badge>
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              인증완료
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            <ShoppingBag className="h-3 w-3 inline mr-1" />
                            구매 {user.purchaseCount}건 · {user.totalSpent.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 (관리자 본인은 수정 불가) */}
                    {user.email !== "wnsrb2898@naver.com" && (
                      <div className="flex gap-2">
                        {user.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDialog({
                              show: true,
                              action: 'deactivate',
                              userId: user._id,
                              userName: user.name
                            })}
                            className="gap-2 text-orange-600 hover:text-orange-700"
                          >
                            <Ban className="h-4 w-4" />
                            비활성화
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDialog({
                              show: true,
                              action: 'activate',
                              userId: user._id,
                              userName: user.name
                            })}
                            className="gap-2 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            활성화
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDialog({
                            show: true,
                            action: 'delete',
                            userId: user._id,
                            userName: user.name
                          })}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 확인 다이얼로그 */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  {confirmDialog.action === 'delete' ? '사용자 삭제' : 
                   confirmDialog.action === 'deactivate' ? '사용자 비활성화' : '사용자 활성화'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    <strong>{confirmDialog.userName}</strong> 사용자를{' '}
                    {confirmDialog.action === 'delete' ? '완전히 삭제' : 
                     confirmDialog.action === 'deactivate' ? '비활성화' : '다시 활성화'}
                    하시겠습니까?
                  </p>
                  {confirmDialog.action === 'delete' && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ 이 작업은 되돌릴 수 없습니다. 사용자의 모든 데이터가 삭제됩니다.
                    </p>
                  )}
                  {confirmDialog.action === 'deactivate' && (
                    <p className="text-sm text-gray-600 mt-2">
                      💡 비활성화된 사용자는 로그인할 수 없지만 데이터는 보존됩니다.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog(null)}
                  >
                    취소
                  </Button>
                  <Button
                    variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
                    onClick={() => {
                      if (confirmDialog.action === 'delete') {
                        handleDelete(confirmDialog.userId)
                      } else if (confirmDialog.action === 'deactivate') {
                        handleDeactivate(confirmDialog.userId)
                      } else {
                        handleActivate(confirmDialog.userId)
                      }
                    }}
                  >
                    {confirmDialog.action === 'delete' ? '삭제' : 
                     confirmDialog.action === 'deactivate' ? '비활성화' : '활성화'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}


