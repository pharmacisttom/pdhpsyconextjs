import { RiskLevel, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export interface CalculatedRiskResult {
  totalScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
  isHighRisk: boolean;
  isCritical: boolean;
}

export class RiskService {
  /**
   * Calculates total score and determines risk level based on dynamic risk rules in the database
   */
  static async evaluateFormRisk(
    formId: string,
    answers: { score: number; questionId: string; optionId?: string | null }[]
  ): Promise<CalculatedRiskResult> {
    const totalScore = answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

    // Fetch active risk rules for this form
    const riskRules = await prisma.riskRule.findMany({
      where: { formId, active: true },
      orderBy: { minScore: 'asc' },
    });

    let matchedLevel: RiskLevel = RiskLevel.LOW;
    let recommendation = 'ไม่มีสัญญาณเตือนผิดปกติที่น่ากังวล ควรดูแลสุขภาพจิตและพักผ่อนให้เพียงพอ';

    for (const rule of riskRules) {
      if (totalScore >= rule.minScore && totalScore <= rule.maxScore) {
        matchedLevel = rule.riskLevel;
        recommendation = rule.recommendation;
        break;
      }
    }

    // Fallback if score exceeds all upper bounds
    if (riskRules.length > 0 && !matchedLevel) {
      const highestRule = riskRules[riskRules.length - 1];
      if (totalScore >= highestRule.minScore) {
        matchedLevel = highestRule.riskLevel;
        recommendation = highestRule.recommendation;
      }
    }

    const isHighRisk = matchedLevel === RiskLevel.HIGH;
    const isCritical = matchedLevel === RiskLevel.CRITICAL;

    return {
      totalScore,
      riskLevel: matchedLevel,
      recommendation,
      isHighRisk: isHighRisk || isCritical,
      isCritical,
    };
  }

  /**
   * Generates urgent clinical action advice for severe cases
   */
  static getUrgentActionGuidance(riskLevel: RiskLevel): string[] {
    if (riskLevel === RiskLevel.CRITICAL) {
      return [
        'กรุณาอย่าอยู่คนเดียว ให้ปรึกษาญาติหรือบุคคลที่ไว้วางใจทันที',
        'โทรสายด่วนสุขภาพจิต 1323 (โทรฟรี ตลอด 24 ชั่วโมง)',
        'ติดต่อคลินิกจิตเวช โรงพยาบาลปลวกแดง โทร 033 650413 ต่อ 115 (หรือกรณีฉุกเฉินโทร 1669)',
        'เจ้าหน้าที่คลินิกสุขภาพจิตและจิตเวช รพ.ปลวกแดง กำลังประสานงานเพื่อให้คำปรึกษา',
      ];
    }
    if (riskLevel === RiskLevel.HIGH) {
      return [
        'แนะนำให้เข้ามาปรึกษาบุคลากรทางการแพทย์ที่คลินิกสุขภาพจิต รพ.ปลวกแดง ในวันและเวลาราชการ',
        'พูดคุยระบายความรู้สึกกับคนรอบข้างที่เข้าใจ',
        'หากมีความเครียดหรือกังวลมาก สามารถโทรสายด่วน 1323 ได้ตลอด 24 ชม.',
      ];
    }
    return [
      'พักผ่อนให้เพียงพออย่างน้อย 7-8 ชั่วโมงต่อวัน',
      'ออกกำลังกายสม่ำเสมอและทำกิจกรรมที่ตนเองชอบ',
      'สามารถกลับมาประเมินซ้ำได้ทุก 2-4 สัปดาห์',
    ];
  }
}
