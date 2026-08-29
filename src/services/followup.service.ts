import { prisma } from '@/lib/db/prisma';
import { FollowUpStatus, FollowUpPriority } from '@prisma/client';
import { maskCitizenId, maskName, maskPhone } from '@/lib/security/masking';
import { decryptPII } from '@/lib/encryption/crypto';

export interface UpdateFollowUpInput {
  caseId: string;
  userId: string;
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  assignedTo?: string | null;
  nextFollowUpDate?: Date | null;
  noteText?: string;
}

export class FollowUpService {
  /**
   * Retrieves follow-up cases with masked participant details
   */
  static async getCases(params: {
    status?: FollowUpStatus;
    priority?: FollowUpPriority;
    assignedTo?: string;
    limit?: number;
  }) {
    const cases = await prisma.followUpCase.findMany({
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.priority ? { priority: params.priority } : {}),
        ...(params.assignedTo ? { assignedTo: params.assignedTo } : {}),
      },
      include: {
        session: {
          include: {
            form: true,
            participant: true,
          },
        },
        assignedUser: {
          select: { id: true, fullName: true, username: true, role: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: params.limit || 100,
    });

    return cases.map((c) => {
      const p = c.session.participant;
      const firstNameDecrypted = p?.firstNameEncrypted ? decryptPII(p.firstNameEncrypted) : null;
      const lastNameDecrypted = p?.lastNameEncrypted ? decryptPII(p.lastNameEncrypted) : null;
      const citizenIdDecrypted = p?.citizenIdEncrypted ? decryptPII(p.citizenIdEncrypted) : null;
      const phoneDecrypted = p?.phoneEncrypted ? decryptPII(p.phoneEncrypted) : null;

      return {
        id: c.id,
        sessionId: c.screeningSessionId,
        publicToken: c.session.publicToken,
        formCode: c.session.form.code,
        formTitle: c.session.form.title,
        riskLevel: c.session.riskLevel,
        totalScore: c.session.totalScore,
        status: c.status,
        priority: c.priority,
        nextFollowUpDate: c.nextFollowUpDate,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        assignedUser: c.assignedUser,
        participantMasked: {
          name: maskName(firstNameDecrypted, lastNameDecrypted),
          citizenId: maskCitizenId(citizenIdDecrypted),
          phone: maskPhone(phoneDecrypted),
          age: p?.age,
          gender: p?.gender,
          district: p?.district,
        },
        notesCount: c.notes.length,
        latestNote: c.notes[0]?.note || null,
        notes: c.notes,
      };
    });
  }

  /**
   * Updates follow up status, assignment, next date, and adds a note
   */
  static async updateCase(input: UpdateFollowUpInput) {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.followUpCase.findUnique({
        where: { id: input.caseId },
      });

      if (!existing) {
        throw new Error('ไม่พบข้อมูลเคสติดตาม');
      }

      const caseData: any = {};
      if (input.status) caseData.status = input.status;
      if (input.priority) caseData.priority = input.priority;
      if (input.assignedTo !== undefined) caseData.assignedTo = input.assignedTo;
      if (input.nextFollowUpDate !== undefined) caseData.nextFollowUpDate = input.nextFollowUpDate;

      const updatedCase = await tx.followUpCase.update({
        where: { id: input.caseId },
        data: caseData,
      });

      if (input.noteText && input.noteText.trim()) {
        await tx.followUpNote.create({
          data: {
            caseId: input.caseId,
            userId: input.userId,
            note: input.noteText.trim(),
          },
        });
      }

      return updatedCase;
    });

    return updated;
  }
}
