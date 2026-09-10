import { NextRequest, NextResponse } from 'next/server';
import { getMessageDetailForMailbox } from '@/lib/email-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;
  const address = decodeURIComponent(id);
  const { searchParams } = new URL(request.url);

  let token = searchParams.get('token');
  const authHeader = request.headers.get('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  try {
    const message = await getMessageDetailForMailbox(address, messageId, token);
    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: `Message with ID "${messageId}" was not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMsg,
        },
      },
      { status: 500 }
    );
  }
}
