"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import QuestionForm from "@/components/QuestionForm"
import { Question } from "@/types/question"
import { QuestionFormData } from "@/utils/validation"

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchQuestion()
    }
  }, [session])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuestion(data)
      } else if (response.status === 404) {
        alert("문제를 찾을 수 없습니다.")
        router.push("/questions")
      }
    } catch (error) {
      console.error("문제 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/questions")
      } else {
        const error = await response.json()
        alert(error.message || "문제 수정에 실패했습니다.")
      }
    } catch (error) {
      console.error("문제 수정 오류:", error)
      alert("문제 수정 중 오류가 발생했습니다.")
    }
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center">로그인이 필요합니다.</div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">로딩 중...</div>
      </Layout>
    )
  }

  if (!question) {
    return (
      <Layout>
        <div className="text-center">문제를 찾을 수 없습니다.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">문제 수정</h1>
          <p className="text-muted-foreground">문제 내용을 수정해보세요</p>
        </div>

        <QuestionForm
          question={question}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </div>
    </Layout>
  )
}