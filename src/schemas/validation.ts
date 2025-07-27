import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  name: z.string().min(2, '이름은 최소 2글자 이상이어야 합니다').max(50, '이름은 50글자를 초과할 수 없습니다'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다').optional(),
  account_type: z.enum(['individual', 'expert', 'admin']).default('individual'),
});

export const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8글자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 최소 2글자 이상이어야 합니다'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// Expert application validation schema
export const expertApplicationSchema = z.object({
  name: z.string().min(2, '이름은 최소 2글자 이상이어야 합니다').max(50, '이름은 50글자를 초과할 수 없습니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  bio: z.string().min(10, '자기소개는 최소 10글자 이상이어야 합니다').max(1000, '자기소개는 1000글자를 초과할 수 없습니다'),
  specialties: z.array(z.string()).min(1, '최소 하나의 전문분야를 선택해주세요').max(10, '전문분야는 최대 10개까지 선택 가능합니다'),
  rate: z.number().min(0, '시급은 0원 이상이어야 합니다').max(1000000, '시급은 100만원을 초과할 수 없습니다'),
});

// Payment validation schema
export const paymentSchema = z.object({
  amount: z.number().min(1, '결제 금액은 1원 이상이어야 합니다').max(10000000, '결제 금액은 1천만원을 초과할 수 없습니다'),
  type: z.enum(['certificate', 'expert_verification']),
  orderId: z.string().min(1, '주문 ID가 필요합니다'),
});

// Certificate validation schema
export const certificateSchema = z.object({
  type: z.enum(['comprehensive', 'specific']),
  careers: z.array(z.number()).min(1, '최소 하나의 경력을 선택해주세요'),
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), '유효한 날짜를 입력해주세요'),
});

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!(file instanceof File)) return false;
    return file.size <= 10 * 1024 * 1024; // 10MB limit
  }, '파일 크기는 10MB를 초과할 수 없습니다'),
  type: z.enum(['profile_image', 'document', 'certificate']),
});

// Search and filter validation schemas
export const searchSchema = z.object({
  query: z.string().max(100, '검색어는 100글자를 초과할 수 없습니다').optional(),
  page: z.number().min(1, '페이지는 1 이상이어야 합니다').default(1),
  limit: z.number().min(1).max(100, '한 페이지당 최대 100개까지 조회 가능합니다').default(10),
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'email']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Admin action validation schemas
export const adminActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500, '사유는 500글자를 초과할 수 없습니다').optional(),
});

// Type exports for use in components
export type UserFormData = z.infer<typeof userSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ExpertApplicationFormData = z.infer<typeof expertApplicationSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type CertificateFormData = z.infer<typeof certificateSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type AdminActionFormData = z.infer<typeof adminActionSchema>;