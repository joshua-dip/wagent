"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024 // lg 브레이크포인트
      setIsMobile(mobile)
    }

    // 초기 체크
    checkScreenSize()

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 초기 로드시에만 모바일에서 자동 접기
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  // ESC 키로 모바일에서 사이드바 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && !isCollapsed) {
        setIsCollapsed(true)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobile, isCollapsed])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}