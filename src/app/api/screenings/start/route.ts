import { NextResponse } from 'next/server';
import { ScreeningService } from '@/services/screening.service';
import { startScreeningSchema } from '@/lib/validation/schemas';
import { extractClientIp } from '@/lib/security/ip-hash';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = extractClientIp(req);
    const rate = checkRateLimit(`screening-start-${ip}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rate.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'ทำรายการถี่เกินไป กรุณารอสักครู่' } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = startScreeningSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
          },
        },
        { status: 400 }
      );
    }

    const result = await ScreeningService.startSession({
      formCode: validated.data.formCode,
      participant: validated.data.participant,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message || 'เกิดข้อผิดพลาด' } },
      { status: 500 }
    );
  }
}
