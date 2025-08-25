"use client"

import Header from "./Header"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
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
            className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
            style={{ top: 'calc(3.5rem + 0.5rem)' }}
            onClick={() => setIsCollapsed(true)}
          />
        )}
        
        <aside className={`fixed left-0 border-r bg-background transition-all duration-300 ${
          isMobile && !isCollapsed ? "z-40" : "z-10"
        }`}
        style={{
          top: 'calc(3.5rem + 0.5rem)', // 헤더 + 여백
          height: 'calc(100vh - 3.5rem - 0.5rem)'
        }}>
          <Sidebar />
        </aside>
        
        <main 
          className={`transition-all duration-300 flex flex-col min-h-0 ${
            isMobile 
              ? 'ml-16' // 모바일에서는 항상 접힌 크기 (오버레이 모드)
              : isCollapsed 
                ? 'fixed left-16 right-0 overflow-y-auto' // 접힌 상태: 고정 위치로 중앙 배치
                : 'ml-64' // 펼친 상태: 일반 배치
          }`}
          style={{
            top: isMobile ? undefined : (isCollapsed ? 'calc(3.5rem + 0.5rem)' : undefined), // 접힌 상태에서 헤더 + 여백
            height: isMobile ? undefined : (isCollapsed ? 'calc(100vh - 3.5rem - 0.5rem)' : undefined)
          }}
        >
          {/* 메인 콘텐츠 */}
          <div className="flex-1 p-3 sm:p-6 pt-4 sm:pt-6">
            {children}
          </div>
          
          {/* Footer - 메인 콘텐츠 영역 내부에 배치 */}
          <Footer />
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