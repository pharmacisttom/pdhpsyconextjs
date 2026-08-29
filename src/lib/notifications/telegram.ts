import { logger } from '@/lib/security/logger';

interface TelegramAlertPayload {
  formTitle: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  totalScore: number;
  publicToken: string;
  district?: string | null;
  age?: number | null;
  gender?: string | null;
  timestamp: string;
}

/**
 * Dispatches Telegram Bot alert for High/Critical risk screenings
 * Note: Never includes raw citizen ID or full name in notifications
 */
export async function sendTelegramAlert(payload: TelegramAlertPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.info('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
    return false;
  }

  const riskEmoji = payload.riskLevel === 'CRITICAL' ? '🚨🚨 [CRITICAL]' : '⚠️ [HIGH RISK]';
  const genderMap: Record<string, string> = {
    male: 'ชาย',
    female: 'หญิง',
    other: 'อื่นๆ',
    unspecified: 'ไม่ระบุ',
  };

  const message = `
${riskEmoji} <b>แจ้งเตือนผู้รับบริการความเสี่ยงสูง</b>
🏥 <b>โรงพยาบาลปลวกแดง (PDHPSYCO)</b>
━━━━━━━━━━━━━━━━━
📋 <b>แบบประเมิน:</b> ${payload.formTitle}
📊 <b>ระดับความเสี่ยง:</b> <code>${payload.riskLevel}</code>
🎯 <b>คะแนนที่ได้:</b> ${payload.totalScore} คะแนน
📍 <b>พื้นที่:</b> ${payload.district || 'ไม่ระบุ'}
👤 <b>ข้อมูลเบื้องต้น:</b> อายุ ${payload.age ? `${payload.age} ปี` : 'ไม่ระบุ'} | เพศ ${payload.gender ? genderMap[payload.gender] || payload.gender : 'ไม่ระบุ'}
🕒 <b>เวลาที่บันทึก:</b> ${new Date(payload.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
🔑 <b>รหัสเคส (Token):</b> <code>${payload.publicToken.substring(0, 8)}...</code>
━━━━━━━━━━━━━━━━━
🔗 <i>กรุณาเข้าสู่ระบบแดชบอร์ดเพื่อตรวจสอบและดำเนินการติดตามผู้รับบริการ</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error('Failed to send Telegram alert', { status: res.status, err: errText });
      return false;
    }

    logger.info('Telegram alert sent successfully', { riskLevel: payload.riskLevel });
    return true;
  } catch (error) {
    logger.error('Telegram notification network error', error);
    return false;
  }
}
