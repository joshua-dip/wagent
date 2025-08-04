"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  loading: boolean
  authenticated: boolean
}

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false
  })

  // 세션 확인
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check-session')
      const data = await response.json()

      if (response.ok && data.authenticated) {
        setAuthState({
          user: data.user,
          loading: false,
          authenticated: true
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false
        })
      }
    } catch (error) {
      console.error('세션 확인 오류:', error)
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      })
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/auth/check-session', { method: 'DELETE' })
      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      })
      window.location.href = '/auth/simple-signin'
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return {
    ...authState,
    logout,
    refetch: checkSession
  }
}