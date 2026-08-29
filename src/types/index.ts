export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'VIEWER';

export type RiskLevelType = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SessionStatusType = 'STARTED' | 'COMPLETED' | 'CANCELLED';

export type FollowUpStatusType = 'NEW' | 'CONTACTED' | 'FOLLOWING' | 'REFERRED' | 'CLOSED';

export type FollowUpPriorityType = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type AlertStatusType = 'NEW' | 'ACKNOWLEDGED' | 'CLOSED';

export type QuestionTypeEnum = 'radio' | 'checkbox' | 'number' | 'text' | 'scale';

export interface PublicScreeningForm {
  id: string;
  code: string;
  title: string;
  description: string | null;
  version: number;
  questions: {
    id: string;
    questionOrder: number;
    questionText: string;
    questionType: QuestionTypeEnum;
    required: boolean;
    options: {
      id: string;
      label: string;
      value: string;
      score: number;
      order: number;
    }[];
  }[];
}

export interface ScreeningSessionResponse {
  token: string;
  form: {
    id: string;
    code: string;
    title: string;
    description: string | null;
  };
  startedAt: string;
}

export interface ScreeningResultData {
  publicToken: string;
  formCode: string;
  formTitle: string;
  totalScore: number;
  riskLevel: RiskLevelType;
  recommendation: string;
  completedAt: string;
  district?: string | null;
  age?: number | null;
  gender?: string | null;
  needsUrgentHelp: boolean;
}

export interface DashboardKPIData {
  todayScreenings: number;
  monthScreenings: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  pendingFollowUps: number;
  overdueCases: number;
  totalCompleted: number;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  total?: number;
  low?: number;
  moderate?: number;
  high?: number;
  critical?: number;
  [key: string]: any;
}
