import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/admin-store';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'PIN / Password Admin salah.',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Autentikasi admin berhasil.',
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Format permintaan tidak valid.',
        },
      },
      { status: 400 }
    );
  }
}
