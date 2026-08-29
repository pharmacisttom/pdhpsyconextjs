import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const session = await prisma.screeningSession.findUnique({
      where: { publicToken: token },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบรายการแบบประเมิน' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Answers saved' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
