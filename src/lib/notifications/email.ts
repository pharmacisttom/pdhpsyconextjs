import { logger } from '@/lib/security/logger';

interface EmailAlertPayload {
  to?: string;
  subject: string;
  formTitle: string;
  riskLevel: string;
  totalScore: number;
  publicToken: string;
}

export async function sendEmailAlert(payload: EmailAlertPayload): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    // SMTP not configured, skip gracefully
    return false;
  }
  logger.info('Email notification prepared for dispatch', { subject: payload.subject, risk: payload.riskLevel });
  return true;
}
