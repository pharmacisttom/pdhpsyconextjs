import { sendTelegramAlert } from '@/lib/notifications/telegram';
import { sendN8nWebhook } from '@/lib/notifications/n8n';
import { sendEmailAlert } from '@/lib/notifications/email';
import { logger } from '@/lib/security/logger';

export interface ScreeningAlertNotificationData {
  formCode: string;
  formTitle: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  totalScore: number;
  publicToken: string;
  district?: string | null;
  age?: number | null;
  gender?: string | null;
  screeningId: string;
}

export class NotificationService {
  /**
   * Dispatches notifications to all active channels when a high or critical screening occurs
   */
  static async notifyHighRiskScreening(data: ScreeningAlertNotificationData): Promise<void> {
    const timestamp = new Date().toISOString();

    logger.info('Initiating high-risk notification dispatch', {
      formCode: data.formCode,
      riskLevel: data.riskLevel,
      score: data.totalScore,
    });

    const tasks: Promise<any>[] = [];

    // 1. Telegram Alert
    tasks.push(
      sendTelegramAlert({
        formTitle: data.formTitle,
        riskLevel: data.riskLevel,
        totalScore: data.totalScore,
        publicToken: data.publicToken,
        district: data.district,
        age: data.age,
        gender: data.gender,
        timestamp,
      })
    );

    // 2. n8n Integration Webhook
    tasks.push(
      sendN8nWebhook({
        event: data.riskLevel === 'CRITICAL' ? 'CRITICAL_RISK_SCREENING' : 'HIGH_RISK_SCREENING',
        screeningId: data.screeningId,
        publicToken: data.publicToken,
        formCode: data.formCode,
        risk: data.riskLevel,
        score: data.totalScore,
        district: data.district,
        age: data.age,
        gender: data.gender,
        timestamp,
      })
    );

    // 3. Email Alert
    tasks.push(
      sendEmailAlert({
        subject: `[PDHPSYCO] แจ้งเตือนผู้รับบริการความเสี่ยงระดับ ${data.riskLevel}`,
        formTitle: data.formTitle,
        riskLevel: data.riskLevel,
        totalScore: data.totalScore,
        publicToken: data.publicToken,
      })
    );

    const results = await Promise.allSettled(tasks);
    logger.info('Notification dispatch completed', {
      telegram: results[0].status === 'fulfilled',
      n8n: results[1].status === 'fulfilled',
      email: results[2].status === 'fulfilled',
    });
  }
}
