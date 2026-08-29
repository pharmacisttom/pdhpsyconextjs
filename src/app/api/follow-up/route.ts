import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { FollowUpService } from '@/services/followup.service';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as any) || undefined;
  const priority = (searchParams.get('priority') as any) || undefined;
  const assignedTo = searchParams.get('assignedTo') || undefined;

  try {
    const cases = await FollowUpService.getCases({ status, priority, assignedTo });
    return NextResponse.json({ success: true, data: cases });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
