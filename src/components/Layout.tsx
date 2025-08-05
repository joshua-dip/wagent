"use client"

import Header from "./Header"
import Sidebar from "./Sidebar"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"

interface LayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutProps) {
  const { isCollapsed, setIsCollapsed, isMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex relative">
        {/* 모바일 오버레이 배경 */}
        {isMobile && !isCollapsed && (
          <div 
            className="fixed inset-0 top-14 bg-black/50 z-30 transition-opacity duration-300"
            onClick={() => setIsCollapsed(true)}
          />
        )}
        
        <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300 ${
          isMobile && !isCollapsed ? "z-40" : "z-10"
        }`}>
          <Sidebar />
        </aside>
        
        <main 
          className={`flex-1 p-3 sm:p-6 transition-all duration-300 ${
            isMobile 
              ? 'ml-16' // 모바일에서는 항상 접힌 크기 (오버레이 모드)
              : isCollapsed 
                ? 'ml-16 max-w-7xl mx-auto px-6 sm:px-8' // 큰 화면에서 접힌 경우 중앙 배치 + 여백
                : 'ml-64' // 큰 화면에서 펼친 경우 일반 배치
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}