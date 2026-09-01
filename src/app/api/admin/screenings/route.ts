import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { decryptPII } from '@/lib/encryption/crypto';
import { maskCitizenId, maskName, maskPhone } from '@/lib/security/masking';
import { AuditService } from '@/services/audit.service';
import { extractClientIp } from '@/lib/security/ip-hash';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const formCode = searchParams.get('formCode') || undefined;
  const riskLevel = (searchParams.get('riskLevel') as any) || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const revealPII = searchParams.get('revealPII') === 'true';

  const where: any = {};
  if (formCode) where.form = { code: formCode };
  if (riskLevel) where.riskLevel = riskLevel;
  if (status) where.status = status;

  try {
    const [sessions, total] = await Promise.all([
      prisma.screeningSession.findMany({
        where,
        include: {
          form: { select: { code: true, title: true } },
          participant: true,
          followUp: { select: { id: true, status: true, priority: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.screeningSession.count({ where }),
    ]);

    // If staff requests to reveal PII, record in Audit Log
    if (revealPII && (session.user as any)?.role !== 'VIEWER') {
      const ip = extractClientIp(req);
      AuditService.record({
        userId: (session.user as any)?.id,
        action: 'VIEW_SCREENING_PII',
        entity: 'ScreeningSession',
        metadata: { page, limit, count: sessions.length },
        ipAddress: ip,
      }).catch(() => {});
    }

    const items = sessions.map((s) => {
      const p = s.participant;
      const firstNameDecrypted = p?.firstNameEncrypted ? decryptPII(p.firstNameEncrypted) : null;
      const lastNameDecrypted = p?.lastNameEncrypted ? decryptPII(p.lastNameEncrypted) : null;
      const citizenIdDecrypted = p?.citizenIdEncrypted ? decryptPII(p.citizenIdEncrypted) : null;
      const phoneDecrypted = p?.phoneEncrypted ? decryptPII(p.phoneEncrypted) : null;
      const birthDateDecrypted = p?.birthDateEncrypted ? decryptPII(p.birthDateEncrypted) : null;
      const addressDecrypted = p?.addressEncrypted ? decryptPII(p.addressEncrypted) : null;

      const isAuthorizedToReveal = revealPII && (session.user as any)?.role !== 'VIEWER';

      return {
        id: s.id,
        publicToken: s.publicToken,
        formCode: s.form.code,
        formTitle: s.form.title,
        status: s.status,
        riskLevel: s.riskLevel,
        totalScore: s.totalScore,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
        participant: {
          name: isAuthorizedToReveal
            ? [firstNameDecrypted, lastNameDecrypted].filter(Boolean).join(' ') || 'ผู้ประเมินนิรนาม'
            : maskName(firstNameDecrypted, lastNameDecrypted),
          citizenId: isAuthorizedToReveal
            ? citizenIdDecrypted || '-'
            : maskCitizenId(citizenIdDecrypted),
          phone: isAuthorizedToReveal
            ? phoneDecrypted || '-'
            : maskPhone(phoneDecrypted),
          birthDate: isAuthorizedToReveal ? birthDateDecrypted : null,
          address: isAuthorizedToReveal ? addressDecrypted : null,
          educationLevel: p?.educationLevel || null,
          educationRoom: p?.educationRoom || null,
          age: p?.age || null,
          gender: p?.gender || 'unspecified',
          district: p?.district || null,
        },
        followUp: s.followUp,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
