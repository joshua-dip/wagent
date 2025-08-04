import { z } from 'zod'

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다')
    .toLowerCase(),
    
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 영문, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다'
    ),
    
  confirmPassword: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요'),
    
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(20, '이름은 최대 20자까지 가능합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문만 입력 가능합니다'),
    
  nickname: z
    .string()
    .max(20, '닉네임은 최대 20자까지 가능합니다')
    .optional(),
    
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 휴대폰 번호를 입력해주세요')
    .optional()
    .or(z.literal('')),
    
  birthDate: z
    .string()
    .optional(),
    
  gender: z
    .enum(['male', 'female', 'other'])
    .optional(),
    
  termsAgreed: z
    .boolean()
    .refine((val) => val === true, {
      message: '이용약관에 동의해야 합니다'
    }),
    
  privacyAgreed: z
    .boolean()
    .refine((val) => val === true, {
      message: '개인정보처리방침에 동의해야 합니다'
    }),
    
  marketingAgreed: z
    .boolean()
    .default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
})

export type SignupFormData = z.infer<typeof signupSchema>

// 이메일 중복 체크용 스키마
export const emailCheckSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다')
    .toLowerCase()
})

export type EmailCheckData = z.infer<typeof emailCheckSchema>