export interface Question {
  _id?: string
  title: string
  content: string
  expectedAnswer: string
  gradingCriteria: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface CreateQuestionData {
  title: string
  content: string
  expectedAnswer: string
  gradingCriteria: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export interface QuestionStats {
  totalQuestions: number
  recentQuestions: number
  tagDistribution: { tag: string; count: number }[]
  difficultyDistribution: { difficulty: string; count: number }[]
}