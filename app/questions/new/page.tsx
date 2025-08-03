"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"
import QuestionForm from "@/components/QuestionForm"
import { QuestionFormData } from "@/utils/validation"

export default function NewQuestionPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/questions")
      } else {
        const error = await response.json()
        alert(error.message || "문제 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("문제 생성 오류:", error)
      alert("문제 생성 중 오류가 발생했습니다.")
    }
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center">로그인이 필요합니다.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">새 문제 작성</h1>
          <p className="text-muted-foreground">서술형 문제를 작성해보세요</p>
        </div>

        <QuestionForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}