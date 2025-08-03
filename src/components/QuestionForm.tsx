"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { questionSchema, QuestionFormData } from "@/utils/validation"
import { Question } from "@/types/question"

interface QuestionFormProps {
  question?: Question
  onSubmit: (data: QuestionFormData) => Promise<void>
  isEditing?: boolean
}

export default function QuestionForm({ question, onSubmit, isEditing = false }: QuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(question?.tags || [])
  const [tagInput, setTagInput] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question ? {
      title: question.title,
      content: question.content,
      expectedAnswer: question.expectedAnswer,
      gradingCriteria: question.gradingCriteria,
      difficulty: question.difficulty,
      tags: question.tags,
    } : undefined,
  })

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue("tags", newTags)
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue("tags", newTags)
  }

  const handleFormSubmit = async (data: QuestionFormData) => {
    setIsLoading(true)
    try {
      await onSubmit({ ...data, tags })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "문제 수정" : "새 문제 작성"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">제목</label>
            <Input
              {...register("title")}
              placeholder="문제 제목을 입력해주세요"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* 본문 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">본문 (지문)</label>
            <Textarea
              {...register("content")}
              placeholder="문제의 본문을 입력해주세요"
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* 예상 답안 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">예상 답안</label>
            <Textarea
              {...register("expectedAnswer")}
              placeholder="예상되는 답안을 입력해주세요"
              rows={5}
            />
            {errors.expectedAnswer && (
              <p className="text-sm text-destructive">{errors.expectedAnswer.message}</p>
            )}
          </div>

          {/* 채점 기준 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">채점 기준 (루브릭)</label>
            <Textarea
              {...register("gradingCriteria")}
              placeholder="채점 기준과 평가 요소를 입력해주세요"
              rows={4}
            />
            {errors.gradingCriteria && (
              <p className="text-sm text-destructive">{errors.gradingCriteria.message}</p>
            )}
          </div>

          {/* 난이도 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">난이도</label>
            <select
              {...register("difficulty")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">난이도 선택</option>
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
            {errors.difficulty && (
              <p className="text-sm text-destructive">{errors.difficulty.message}</p>
            )}
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">태그</label>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그를 입력하고 추가 버튼을 클릭하세요"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : isEditing ? "수정" : "저장"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}