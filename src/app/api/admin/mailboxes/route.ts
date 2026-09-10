import { NextRequest, NextResponse } from 'next/server';
import { getAdminMailboxes, saveAdminMailbox, verifyAdminPassword } from '@/lib/admin-store';
import { ServiceId } from '@/lib/types';

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  if (!adminKey || !verifyAdminPassword(adminKey)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'Akses ditolak. PIN Admin diperlukan.' },
      },
      { status: 401 }
    );
  }

  const mailboxes = getAdminMailboxes();
  return NextResponse.json({
    ok: true,
    count: mailboxes.length,
    mailboxes,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminKey = request.headers.get('x-admin-key') || body.adminPassword;

    if (!adminKey || !verifyAdminPassword(adminKey)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Akses ditolak. PIN Admin diperlukan.' },
        },
        { status: 401 }
      );
    }

    if (!body.address || !body.token) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'BAD_REQUEST', message: 'Alamat email dan token wajib diisi.' },
        },
        { status: 400 }
      );
    }

    const saved = saveAdminMailbox({
      address: body.address,
      token: body.token,
      serviceId: (body.serviceId as ServiceId) || 'server-1',
      label: body.label,
      notes: body.notes,
    });

    return NextResponse.json({
      ok: true,
      mailbox: saved,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: msg } },
      { status: 500 }
    );
  }
}
