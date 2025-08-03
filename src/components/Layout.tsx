"use client"

import Header from "./Header"
import Sidebar from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r bg-background">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}