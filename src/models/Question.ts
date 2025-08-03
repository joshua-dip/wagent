import mongoose, { Document, Model, Schema } from 'mongoose'
import { Question } from '@/types/question'

export interface QuestionDocument extends Question, Document {
  _id: string
}

const questionSchema = new Schema<QuestionDocument>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    expectedAnswer: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    gradingCriteria: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags: string[]) => tags.length >= 1 && tags.length <= 10,
        message: '태그는 1개 이상 10개 이하여야 합니다',
      },
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// 인덱스 생성
questionSchema.index({ userId: 1, createdAt: -1 })
questionSchema.index({ tags: 1 })
questionSchema.index({ difficulty: 1 })

const QuestionModel: Model<QuestionDocument> =
  mongoose.models.Question || mongoose.model<QuestionDocument>('Question', questionSchema)

export default QuestionModel