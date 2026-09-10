import { NextRequest, NextResponse } from 'next/server';
import { createNewMailbox, SERVICE_CONFIGS } from '@/lib/email-service';
import { ServiceId } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    let body: { service?: ServiceId; name?: string; domain?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional or empty
    }

    const serviceId = body.service || 'server-1';
    const valid = SERVICE_CONFIGS.some((s) => s.id === serviceId);
    if (!valid) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'UNKNOWN_SERVICE',
            message: `Unknown service "${serviceId}".`,
          },
        },
        { status: 400 }
      );
    }

    const mailbox = await createNewMailbox(serviceId, body.name, body.domain);

    return NextResponse.json(
      {
        ok: true,
        mailbox,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
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
