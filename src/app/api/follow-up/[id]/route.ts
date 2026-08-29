import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { FollowUpService } from '@/services/followup.service';
import { updateFollowUpCaseSchema } from '@/lib/validation/schemas';
import { AuditService } from '@/services/audit.service';
import { extractClientIp } from '@/lib/security/ip-hash';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role === 'VIEWER') {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'ท่านไม่มีสิทธิ์แก้ไขข้อมูล' } }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateFollowUpCaseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const updated = await FollowUpService.updateCase({
      caseId: id,
      userId: user.id,
      status: validated.data.status,
      priority: validated.data.priority,
      assignedTo: validated.data.assignedTo,
      nextFollowUpDate: validated.data.nextFollowUpDate ? new Date(validated.data.nextFollowUpDate) : undefined,
      noteText: validated.data.note,
    });

    const ip = extractClientIp(req);
    AuditService.record({
      userId: user.id,
      action: 'UPDATE_CASE',
      entity: 'FollowUpCase',
      entityId: id,
      metadata: validated.data,
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
