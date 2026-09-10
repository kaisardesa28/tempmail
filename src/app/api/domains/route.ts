import { NextRequest, NextResponse } from 'next/server';
import { fetchDomainsForService, SERVICE_CONFIGS } from '@/lib/email-service';
import { ServiceId } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const service = (searchParams.get('service') as ServiceId) || 'server-1';

  const validService = SERVICE_CONFIGS.some((s) => s.id === service);
  if (!validService) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNKNOWN_SERVICE',
          message: `Unknown service "${service}".`,
        },
      },
      { status: 400 }
    );
  }

  try {
    const domains = await fetchDomainsForService(service);
    return NextResponse.json({
      ok: true,
      service,
      count: domains.length,
      domains,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
