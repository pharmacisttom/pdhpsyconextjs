import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.AUTH_SECRET || 'pdhpsyco_secret';

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid integration token' } }, { status: 401 });
    }

    const body = await req.json();
    logger.info('n8n inbound webhook received', { action: body.action });

    // Handle inbound events from n8n if needed
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTEGRATION_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
