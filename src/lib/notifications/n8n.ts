import { logger } from '@/lib/security/logger';

interface N8nWebhookPayload {
  event: 'HIGH_RISK_SCREENING' | 'CRITICAL_RISK_SCREENING' | 'FOLLOWUP_OVERDUE';
  screeningId: string;
  publicToken: string;
  formCode: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score: number;
  district?: string | null;
  age?: number | null;
  gender?: string | null;
  timestamp: string;
}

/**
 * Dispatches automated webhook event to n8n workflow
 * Never includes raw citizen ID, phone, or patient real name
 */
export async function sendN8nWebhook(payload: N8nWebhookPayload): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.info('n8n webhook skipped: N8N_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PDHPSYCO-Healthcare-System/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logger.error('n8n webhook responded with non-200 status', { status: res.status });
      return false;
    }

    logger.info('n8n webhook dispatched successfully', { event: payload.event });
    return true;
  } catch (error) {
    logger.error('n8n webhook network error', error);
    return false;
  }
}
