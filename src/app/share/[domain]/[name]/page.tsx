'use client';

import React, { useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Mailbox } from '@/lib/types';

interface SharePageProps {
  params: Promise<{ domain: string; name: string }>;
}

const STORAGE_MAILBOX_KEY = 'pakmail_current_mailbox';

export default function SharePage({ params }: SharePageProps) {
  const { domain, name } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const address = `${name}@${domain}`.toLowerCase();
    const token = searchParams.get('t') || '';

    const sharedMailbox: Mailbox = {
      id: encodeURIComponent(address),
      serviceId: domain.includes('gmail') ? 'gmail' : 'server-1',
      address,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      expiresAtIsEstimate: false,
      service: 'Shared Mailbox',
    };

    try {
      localStorage.setItem(STORAGE_MAILBOX_KEY, JSON.stringify(sharedMailbox));
    } catch {}

    // Redirect to home
    router.replace('/');
  }, [domain, name, router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-600/5">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-700">
          Membuka kotak masuk untuk {name}@{domain}…
        </span>
      </div>
    </div>
  );
}
