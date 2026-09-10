import { NextRequest, NextResponse } from 'next/server';
import { deleteStoredMailbox, getStoredMailbox, SERVICE_CONFIGS } from '@/lib/email-service';
import { ServiceId } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = decodeURIComponent(id);
  const { searchParams } = new URL(request.url);
  const service = (searchParams.get('service') as ServiceId) || 'server-1';

  const serviceConfig = SERVICE_CONFIGS.find((s) => s.id === service);
  const stored = getStoredMailbox(address);

  return NextResponse.json({
    ok: true,
    mailbox: {
      id,
      address,
      serviceId: service,
      service: serviceConfig?.label || 'Server 1',
      token: stored?.token || null,
      createdAt: stored?.createdAt || new Date().toISOString(),
      expiresAt: null,
      expiresAtIsEstimate: false,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = decodeURIComponent(id);
  deleteStoredMailbox(address);

  return NextResponse.json({
    ok: true,
    message: 'Mailbox deleted successfully',
  });
}
