import { z } from "zod"

export const questionSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다").max(200, "제목은 200자 이하여야 합니다"),
  content: z.string().min(1, "본문은 필수입니다").max(10000, "본문은 10000자 이하여야 합니다"),
  expectedAnswer: z.string().min(1, "예상 답안은 필수입니다").max(5000, "예상 답안은 5000자 이하여야 합니다"),
  gradingCriteria: z.string().min(1, "채점 기준은 필수입니다").max(3000, "채점 기준은 3000자 이하여야 합니다"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "난이도를 선택해주세요",
  }),
  tags: z.array(z.string()).min(1, "최소 1개의 태그가 필요합니다").max(10, "태그는 최대 10개까지 가능합니다"),
})

export type QuestionFormData = z.infer<typeof questionSchema>