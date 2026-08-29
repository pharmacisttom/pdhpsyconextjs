import { NextResponse } from 'next/server';
import { ScreeningService } from '@/services/screening.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await ScreeningService.getResultByToken(token);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: error.message || 'ไม่พบข้อมูลผลการประเมิน' } },
      { status: 404 }
    );
  }
}
