import { NextResponse } from 'next/server';
import { SERVICE_CONFIGS } from '@/lib/email-service';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'PakMail',
    baseUrl: '/api',
    services: SERVICE_CONFIGS,
    rateLimit: {
      create: { limit: 20, window: '60s' },
      read: { limit: 120, window: '60s' },
    },
  });
}
