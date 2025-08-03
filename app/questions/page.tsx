"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Layout from "@/components/Layout"
import Link from "next/link"
import { Question } from "@/types/question"
import { Search, Plus, Edit, Trash2 } from "lucide-react"

export default function QuestionsPage() {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (session) {
      fetchQuestions()
    }
  }, [session, page, searchTerm])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("문제 목록 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 문제를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchQuestions()
      } else {
        alert("삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("문제 삭제 오류:", error)
      alert("삭제 중 오류가 발생했습니다.")
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">문제 목록</h1>
            <p className="text-muted-foreground">생성한 문제들을 관리하세요</p>
          </div>
          <Button asChild>
            <Link href="/questions/new">
              <Plus className="mr-2 h-4 w-4" />
              새 문제 작성
            </Link>
          </Button>
        </div>

        {/* 검색 */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="문제 제목이나 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* 문제 목록 */}
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "검색 결과가 없습니다." : "아직 생성된 문제가 없습니다."}
              </p>
              <Button asChild>
                <Link href="/questions/new">첫 번째 문제 만들기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{question.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="capitalize">
                          난이도: {question.difficulty === "easy" && "쉬움"}
                          {question.difficulty === "medium" && "보통"}
                          {question.difficulty === "hard" && "어려움"}
                        </span>
                        <span>
                          생성일: {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/questions/${question._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(question._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {question.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className="flex items-center px-4">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}