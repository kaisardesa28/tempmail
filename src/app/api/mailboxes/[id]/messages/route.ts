import { NextRequest, NextResponse } from 'next/server';
import { getMessagesForMailbox, SERVICE_CONFIGS, verifyMailboxToken } from '@/lib/email-service';
import { ServiceId } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = decodeURIComponent(id);
  const { searchParams } = new URL(request.url);
  const service = (searchParams.get('service') as ServiceId) || 'server-1';

  // Read token from query or Authorization Bearer header
  let token = searchParams.get('token');
  const authHeader = request.headers.get('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  const serviceConfig = SERVICE_CONFIGS.find((s) => s.id === service);
  if (!serviceConfig) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNKNOWN_SERVICE',
          message: `Service "${service}" is not recognized.`,
        },
      },
      { status: 400 }
    );
  }

  // Token check (PakMail requires token for access)
  if (serviceConfig.requiresTokenForRead && !token) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'This service requires an access token to view inbox messages.',
        },
      },
      { status: 401 }
    );
  }

  if (token && !verifyMailboxToken(address, token)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'The provided access token does not match this mailbox.',
        },
      },
      { status: 403 }
    );
  }

  try {
    const messages = await getMessagesForMailbox(address, service, token);

    return NextResponse.json({
      ok: true,
      mailbox: address,
      service: serviceConfig.label,
      serviceId: service,
      count: messages.length,
      messages,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error fetching messages';
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
