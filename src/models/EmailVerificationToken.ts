import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailVerificationToken extends Document {
  email: string
  code: string // 6자리 인증번호
  expiresAt: Date
  createdAt: Date
  attempts: number // 시도 횟수
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// TTL 인덱스: expiresAt 시간이 지나면 자동 삭제
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// 이메일 인덱스
emailVerificationTokenSchema.index({ email: 1 })

const EmailVerificationToken = mongoose.models.EmailVerificationToken || 
  mongoose.model<IEmailVerificationToken>('EmailVerificationToken', emailVerificationTokenSchema)

export default EmailVerificationToken

