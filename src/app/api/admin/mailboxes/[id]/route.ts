import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminMailbox, verifyAdminPassword } from '@/lib/admin-store';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  deleteAdminMailbox(id);

  return NextResponse.json({
    ok: true,
    message: 'Email berhasil dihapus dari pantauan admin.',
  });
}
