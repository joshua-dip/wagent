import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  nickname?: string
  phone?: string
  phoneVerified?: boolean
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  marketingAgreed: boolean
  termsAgreed: boolean
  privacyAgreed: boolean
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean
  isActive: boolean
  kakaoId?: string
  signupMethod?: 'email' | 'kakao' | 'phone'
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, '이메일은 필수입니다'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '올바른 이메일 형식이 아닙니다']
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다']
  },
  name: {
    type: String,
    required: [true, '이름은 필수입니다'],
    trim: true,
    minlength: [2, '이름은 최소 2자 이상이어야 합니다'],
    maxlength: [20, '이름은 최대 20자까지 가능합니다']
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [20, '닉네임은 최대 20자까지 가능합니다']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 휴대폰 번호 형식이 아닙니다']
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  birthDate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  marketingAgreed: {
    type: Boolean,
    default: false
  },
  termsAgreed: {
    type: Boolean,
    required: [true, '이용약관 동의는 필수입니다'],
    validate: {
      validator: function(v: boolean) {
        return v === true
      },
      message: '이용약관에 동의해야 합니다'
    }
  },
  privacyAgreed: {
    type: Boolean,
    required: [true, '개인정보처리방침 동의는 필수입니다'],
    validate: {
      validator: function(v: boolean) {
        return v === true
      },
      message: '개인정보처리방침에 동의해야 합니다'
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  kakaoId: {
    type: String,
    unique: true,
    sparse: true // null 값 허용
  },
  signupMethod: {
    type: String,
    enum: ['email', 'kakao', 'phone'],
    default: 'email'
  }
}, {
  timestamps: true
})

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// 이메일 중복 체크 정적 메서드
userSchema.statics.isEmailTaken = async function(email: string, excludeUserId?: string) {
  const user = await this.findOne({ 
    email: email.toLowerCase(),
    ...(excludeUserId && { _id: { $ne: excludeUserId } })
  })
  return !!user
}

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User