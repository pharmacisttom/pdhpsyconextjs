import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { encryptPII, decryptPII } from '@/lib/encryption/crypto';
import { hashIp } from '@/lib/security/ip-hash';
import { logger } from '@/lib/security/logger';
import { RiskService } from './risk.service';
import { NotificationService } from './notification.service';
import { RiskLevel, SessionStatus, AlertStatus, FollowUpStatus, FollowUpPriority } from '@prisma/client';

export interface StartSessionInput {
  formCode: string;
  ipAddress?: string;
  userAgent?: string;
  participant?: {
    consent: boolean;
    citizenId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    age?: number | null;
    gender?: string | null;
    district?: string | null;
  };
}

export interface SubmitAnswersInput {
  publicToken: string;
  answers: {
    questionId: string;
    optionId?: string | null;
    answerValue?: string | null;
    score: number;
  }[];
}

export class ScreeningService {
  /**
   * Starts a new screening session with a unique UUID public token
   */
  static async startSession(input: StartSessionInput) {
    const form = await prisma.screeningForm.findUnique({
      where: { code: input.formCode, status: 'ACTIVE' },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!form) {
      throw new Error(`ไม่พบแบบประเมินรหัส ${input.formCode} หรือแบบประเมินยังไม่เปิดใช้งาน`);
    }

    const publicToken = crypto.randomUUID();
    const ipHash = hashIp(input.ipAddress);

    // Create session in transaction
    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.screeningSession.create({
        data: {
          publicToken,
          formId: form.id,
          status: SessionStatus.STARTED,
          ipHash,
          userAgent: input.userAgent,
        },
      });

      // If participant demographics provided, save with AES-256-GCM encryption
      if (input.participant) {
        await tx.participant.create({
          data: {
            screeningSessionId: newSession.id,
            citizenIdEncrypted: encryptPII(input.participant.citizenId),
            firstNameEncrypted: encryptPII(input.participant.firstName),
            lastNameEncrypted: encryptPII(input.participant.lastName),
            phoneEncrypted: encryptPII(input.participant.phone),
            age: input.participant.age,
            gender: input.participant.gender,
            district: input.participant.district,
            consent: input.participant.consent || false,
          },
        });
      }

      return newSession;
    });

    logger.info('Screening session started', { formCode: form.code, sessionId: session.id });

    return {
      publicToken,
      form: {
        id: form.id,
        code: form.code,
        title: form.title,
        description: form.description,
        version: form.version,
        questions: form.questions.map((q) => ({
          id: q.id,
          questionOrder: q.questionOrder,
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required,
          options: q.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            value: opt.value,
            score: opt.score,
            order: opt.order,
          })),
        })),
      },
    };
  }

  /**
   * Submits answers, calculates score, evaluates risk, creates alerts/followups, and completes the session
   */
  static async completeSession(input: SubmitAnswersInput) {
    const session = await prisma.screeningSession.findUnique({
      where: { publicToken: input.publicToken },
      include: {
        form: true,
        participant: true,
      },
    });

    if (!session) {
      throw new Error('ไม่พบรายการประเมินที่ระบุ');
    }

    if (session.status === SessionStatus.COMPLETED) {
      // Already completed, return existing result
      return this.getResultByToken(input.publicToken);
    }

    // Evaluate Risk
    const evaluation = await RiskService.evaluateFormRisk(session.formId, input.answers);

    // Save answers and complete session inside transaction
    const completedSession = await prisma.$transaction(async (tx) => {
      // 1. Delete previous partial answers if any
      await tx.screeningAnswer.deleteMany({
        where: { sessionId: session.id },
      });

      // 2. Insert new answers
      await tx.screeningAnswer.createMany({
        data: input.answers.map((ans) => ({
          sessionId: session.id,
          questionId: ans.questionId,
          optionId: ans.optionId || null,
          answerValue: ans.answerValue || null,
          score: ans.score || 0,
        })),
      });

      // 3. Update session status and scores
      const updated = await tx.screeningSession.update({
        where: { id: session.id },
        data: {
          status: SessionStatus.COMPLETED,
          completedAt: new Date(),
          totalScore: evaluation.totalScore,
          riskLevel: evaluation.riskLevel,
        },
      });

      // 4. If High or Critical Risk -> Create Alert & FollowUpCase
      if (evaluation.isHighRisk || evaluation.isCritical) {
        // Create Alert
        await tx.alert.create({
          data: {
            screeningSessionId: session.id,
            severity: evaluation.riskLevel,
            status: AlertStatus.NEW,
          },
        });

        // Create FollowUpCase
        await tx.followUpCase.create({
          data: {
            screeningSessionId: session.id,
            status: FollowUpStatus.NEW,
            priority: evaluation.isCritical ? FollowUpPriority.URGENT : FollowUpPriority.HIGH,
            nextFollowUpDate: new Date(Date.now() + (evaluation.isCritical ? 1 : 3) * 24 * 60 * 60 * 1000),
          },
        });
      }

      return updated;
    });

    logger.info('Screening session completed', {
      formCode: session.form.code,
      riskLevel: evaluation.riskLevel,
      score: evaluation.totalScore,
    });

    // Asynchronously trigger notifications if High/Critical
    if (evaluation.isHighRisk || evaluation.isCritical) {
      NotificationService.notifyHighRiskScreening({
        formCode: session.form.code,
        formTitle: session.form.title,
        riskLevel: evaluation.riskLevel,
        totalScore: evaluation.totalScore,
        publicToken: session.publicToken,
        district: session.participant?.district,
        age: session.participant?.age,
        gender: session.participant?.gender,
        screeningId: session.id,
      }).catch((err) => logger.error('Notification dispatch error', err));
    }

    return {
      publicToken: session.publicToken,
      formCode: session.form.code,
      formTitle: session.form.title,
      totalScore: evaluation.totalScore,
      riskLevel: evaluation.riskLevel,
      recommendation: evaluation.recommendation,
      completedAt: completedSession.completedAt?.toISOString() || new Date().toISOString(),
      district: session.participant?.district,
      age: session.participant?.age,
      gender: session.participant?.gender,
      needsUrgentHelp: evaluation.isHighRisk || evaluation.isCritical,
      urgentGuidance: RiskService.getUrgentActionGuidance(evaluation.riskLevel),
    };
  }

  /**
   * Retrieves anonymous result for public token
   */
  static async getResultByToken(publicToken: string) {
    const session = await prisma.screeningSession.findUnique({
      where: { publicToken },
      include: {
        form: {
          include: {
            riskRules: true,
          },
        },
        participant: true,
      },
    });

    if (!session || session.status !== SessionStatus.COMPLETED) {
      throw new Error('ไม่พบผลการประเมิน หรือแบบประเมินยังทำไม่เสร็จสิ้น');
    }

    // Find recommendation from risk rules
    let recommendation = 'ไม่มีข้อแนะนำเพิ่มเติม';
    if (session.riskLevel) {
      const rule = session.form.riskRules.find((r) => r.riskLevel === session.riskLevel);
      if (rule) recommendation = rule.recommendation;
    }

    const isHigh = session.riskLevel === RiskLevel.HIGH || session.riskLevel === RiskLevel.CRITICAL;

    return {
      publicToken: session.publicToken,
      formCode: session.form.code,
      formTitle: session.form.title,
      totalScore: session.totalScore || 0,
      riskLevel: session.riskLevel || RiskLevel.LOW,
      recommendation,
      completedAt: session.completedAt?.toISOString() || session.createdAt.toISOString(),
      district: session.participant?.district,
      age: session.participant?.age,
      gender: session.participant?.gender,
      needsUrgentHelp: isHigh,
      urgentGuidance: RiskService.getUrgentActionGuidance(session.riskLevel || RiskLevel.LOW),
    };
  }
}
