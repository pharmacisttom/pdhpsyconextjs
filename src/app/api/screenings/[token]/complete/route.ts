import { NextResponse } from 'next/server';
import { ScreeningService } from '@/services/screening.service';
import { submitAnswersSchema } from '@/lib/validation/schemas';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const validated = submitAnswersSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validated.error.errors[0]?.message || 'ข้อมูลคำตอบไม่ถูกต้อง',
          },
        },
        { status: 400 }
      );
    }

    const result = await ScreeningService.completeSession({
      publicToken: token,
      answers: validated.data.answers,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SUBMIT_ERROR', message: error.message || 'ไม่สามารถส่งคำตอบได้' } },
      { status: 500 }
    );
  }
}
