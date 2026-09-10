import { NextRequest, NextResponse } from 'next/server';
import { sendSimulatedTestEmail } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = decodeURIComponent(id);

  let type: 'verification' | 'welcome' = 'verification';
  try {
    const body = await request.json();
    if (body.type === 'welcome') {
      type = 'welcome';
    }
  } catch {
    // default to verification
  }

  const message = sendSimulatedTestEmail(address, type);

  return NextResponse.json({
    ok: true,
    message: 'Test email generated and delivered to inbox successfully',
    email: message,
  });
}
