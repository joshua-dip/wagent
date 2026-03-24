"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, Shield } from "lucide-react"

function AdminSignInForm() {
  const searchParams = useSearchParams()
  const nextRaw = searchParams.get("next") || "/admin/dashboard"
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/admin/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "로그인에 실패했습니다.")
        setMessageType("error")
        setLoading(false)
        return
      }

      if (data.user?.role !== "admin") {
        await fetch("/api/auth/check-session", {
          method: "DELETE",
          credentials: "include",
        })
        setMessage("관리자 계정만 이 화면으로 로그인할 수 있습니다.")
        setMessageType("error")
        setLoading(false)
        return
      }

      setMessage("로그인 성공! 이동 중...")
      setMessageType("success")
      window.location.href = next
    } catch {
      setMessage("로그인 처리 중 오류가 발생했습니다.")
      setMessageType("error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-slate-400 text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            ← PAYPERIC 홈
          </Link>
        </div>

        <Card className="border-slate-700 bg-slate-950 text-slate-100 shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <CardTitle className="text-xl text-white">관리자 로그인</CardTitle>
            <p className="text-sm text-slate-400 font-normal">
              운영자 전용 · 일반 회원은 카카오 로그인을 이용해 주세요
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="admin-email" className="text-slate-300">
                  이메일
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5 bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="admin-password" className="text-slate-300">
                  비밀번호
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5 bg-slate-900 border-slate-600 text-white"
                />
              </div>

              {message && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-emerald-950 text-emerald-200 border border-emerald-800"
                      : "bg-red-950 text-red-200 border border-red-900"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    확인 중…
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-6">
              이 URL은 북마크만으로 접속합니다. 고객용 로그인은{" "}
              <Link href="/auth/simple-signin" className="text-teal-400 hover:underline">
                카카오 로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AdminSignInForm />
    </Suspense>
  )
}
