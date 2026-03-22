"use client"

/**
 * 공개 네비게이션에 링크되지 않음 — 운영자·기존 이메일 계정용
 * URL 직접 접속: /auth/email-signin
 */
import { useState } from "react"
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EmailSignInPage() {
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
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (!sbError) {
          const bridge = await fetch("/api/auth/supabase-bridge", {
            method: "POST",
            credentials: "include",
          })
          if (bridge.ok) {
            setMessage("로그인 성공! 리다이렉트 중...")
            setMessageType("success")
            window.location.href = "/"
            return
          }
          const b = await bridge.json().catch(() => ({}))
          setMessage(
            typeof b.error === "string"
              ? b.error
              : "세션 연동에 실패했습니다. 잠시 후 다시 시도해 주세요."
          )
          setMessageType("error")
          setLoading(false)
          return
        }
      }

      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("로그인 성공! 리다이렉트 중...")
        setMessageType("success")
        window.location.href = "/"
      } else {
        setMessage(
          data.error ||
            (isSupabaseConfigured()
              ? "이메일 또는 비밀번호가 올바르지 않습니다."
              : "로그인에 실패했습니다.")
        )
        setMessageType("error")
        setLoading(false)
      }
    } catch {
      setMessage("로그인 중 오류가 발생했습니다.")
      setMessageType("error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <p className="text-center text-xs text-slate-500">
          이메일 로그인 (내부·기존 계정용) ·{" "}
          <Link href="/auth/simple-signin" className="text-teal-700 hover:underline">
            카카오 로그인
          </Link>
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">이메일 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              {message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  {message}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    로그인 중…
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
