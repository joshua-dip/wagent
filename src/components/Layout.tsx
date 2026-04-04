"use client"

import Header from "./Header"
import Footer from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-3 sm:p-6 pt-4 sm:pt-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
