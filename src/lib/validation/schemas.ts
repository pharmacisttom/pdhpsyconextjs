import { z } from 'zod';

// Thai Citizen ID Checksum validation
function isValidThaiCitizenId(id: string): boolean {
  const digits = id.replace(/\D/g, '');
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(digits[12], 10);
}

// 1. Participant Demographics Schema
export const participantSchema = z.object({
  consent: z.boolean().refine((val) => val === true, {
    message: 'กรุณายินยอมให้ประมวลผลข้อมูลตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
  }),
  citizenId: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || isValidThaiCitizenId(val), {
      message: 'เลขบัตรประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักตรวจสอบ',
    }),
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^0[689]\d{8}$/.test(val.replace(/\D/g, '')), {
      message: 'เบอร์โทรศัพท์มือถือ 10 หลักไม่ถูกต้อง (เช่น 0812345678)',
    }),
  birthDate: z.string().max(50).optional().or(z.literal('')).nullable(),
  address: z.string().max(500).optional().or(z.literal('')).nullable(),
  educationLevel: z.string().max(100).optional().or(z.literal('')).nullable(),
  educationRoom: z.string().max(50).optional().or(z.literal('')).nullable(),
  age: z
    .number()
    .min(1, 'อายุต้องมากกว่า 0')
    .max(130, 'อายุไม่ถูกต้อง')
    .optional()
    .nullable(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().nullable(),
  district: z.string().max(100).optional().nullable(), // ตำบลใน อ.ปลวกแดง (ปลวกแดง, ตาสิทธิ์, ละหาร, แม่น้ำคู้, มาบยางพร, หนองไร่)
});

// 2. Start Screening Schema
export const startScreeningSchema = z.object({
  formCode: z.string().min(1, 'ต้องระบุรหัสแบบประเมิน'),
  participant: participantSchema.optional(),
});

// 3. Submit Answers Schema
export const submitAnswerItemSchema = z.object({
  questionId: z.string().uuid('รหัสคำถามไม่ถูกต้อง'),
  optionId: z.string().uuid().optional().nullable(),
  answerValue: z.string().optional().nullable(),
  score: z.number().int().default(0),
});

export const submitAnswersSchema = z.object({
  answers: z.array(submitAnswerItemSchema).min(1, 'ต้องมีคำตอบอย่างน้อย 1 ข้อ'),
});

// 4. Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(3, 'กรุณาระบุชื่อผู้ใช้หรืออีเมล'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
});

// 5. User Management Schema
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  fullName: z.string().min(2, 'กรุณาระบุชื่อ-นามสกุล'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'VIEWER']),
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional().or(z.literal('')),
});

// 6. Form Builder Schema
export const screeningOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'ต้องระบุตัวเลือก'),
  value: z.string().min(1),
  score: z.number().int().default(0),
  order: z.number().int().default(0),
});

export const screeningQuestionSchema = z.object({
  id: z.string().optional(),
  questionOrder: z.number().int(),
  questionText: z.string().min(1, 'ต้องระบุข้อคำถาม'),
  questionType: z.enum(['radio', 'checkbox', 'number', 'text', 'scale']),
  required: z.boolean().default(true),
  options: z.array(screeningOptionSchema).default([]),
});

export const riskRuleSchema = z.object({
  id: z.string().optional(),
  minScore: z.number().int(),
  maxScore: z.number().int(),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  recommendation: z.string().min(1, 'ต้องระบุคำแนะนำ'),
  active: z.boolean().default(true),
});

export const formBuilderSchema = z.object({
  code: z.string().min(2).max(20),
  title: z.string().min(3, 'ต้องระบุชื่อแบบประเมิน'),
  description: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  questions: z.array(screeningQuestionSchema).min(1, 'ต้องมีคำถามอย่างน้อย 1 ข้อ'),
  riskRules: z.array(riskRuleSchema).min(1, 'ต้องมีเกณฑ์ประเมินความเสี่ยงอย่างน้อย 1 เกณฑ์'),
});

// 7. Follow-up Case Update Schema
export const updateFollowUpCaseSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'FOLLOWING', 'REFERRED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  nextFollowUpDate: z.string().datetime().optional().nullable(),
  note: z.string().max(2000).optional(),
});
