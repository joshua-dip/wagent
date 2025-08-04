import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useSimpleAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-session', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: data.authenticated
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  return authState
}