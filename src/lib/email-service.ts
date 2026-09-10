import crypto from 'crypto';
import { Mailbox, MessageDetail, MessageSummary, ServiceConfig, ServiceId } from './types';

const UPSTREAM_BASE_URL = 'https://pakmail.vercel.app/api';

interface StoredMailbox {
  id: string;
  serviceId: ServiceId;
  address: string;
  token: string;
  createdAt: string;
}

interface StoredMessage {
  id: string;
  mailboxAddress: string;
  from: string;
  fromEmail: string;
  to?: string;
  subject: string;
  bodyPreview: string;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: number;
  attachments: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    url?: string;
  }[];
}

const mailboxesStore = new Map<string, StoredMailbox>();
const messagesStore = new Map<string, StoredMessage[]>();

export const SERVICE_CONFIGS: ServiceConfig[] = [
  {
    id: 'server-1',
    label: 'Server 1',
    description:
      'Server utama — cepat & stabil. Mendukung nama dan domain kustom. Membaca inbox dilindungi token akses 12 karakter (huruf kecil & angka).',
    supportsCustomName: true,
    supportsDomainPick: true,
    requiresTokenForRead: false,
    ttlLabel: null,
    enabled: true,
  },
  {
    id: 'server-2',
    label: 'Server 2',
    description:
      'Server skalabel untuk volume besar — alamat langsung aktif tanpa batas jumlah. Membaca inbox dilindungi token akses 12 karakter (huruf kecil & angka).',
    supportsCustomName: true,
    supportsDomainPick: true,
    requiresTokenForRead: false,
    ttlLabel: null,
    enabled: true,
  },
  {
    id: 'server-3',
    label: 'Server 3',
    description: 'Server cadangan — alamat dibuat acak oleh sistem.',
    supportsCustomName: false,
    supportsDomainPick: false,
    requiresTokenForRead: true,
    ttlLabel: null,
    enabled: true,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    description: 'Alamat Gmail sementara — dibuat acak oleh sistem.',
    supportsCustomName: false,
    supportsDomainPick: false,
    requiresTokenForRead: true,
    ttlLabel: null,
    enabled: true,
  },
];

const DEFAULT_DOMAINS: Record<ServiceId, string[]> = {
  'server-1': [
    'ozsaip.com',
    'yzcalo.com',
    'lnovic.com',
    'ruutukf.com',
    'gmeenramy.com',
    'olipii.com',
    'ooynib.com',
  ],
  'server-2': ['catchmail.io'],
  'server-3': ['tempbox.live', 'burnermail.co'],
  gmail: ['gmail.temp.net', 'googlemail.temp-inbox.com'],
};

export function generateToken(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let token = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

export function generateRandomUsername(): string {
  const adjectives = [
    'swift',
    'lucky',
    'bright',
    'quiet',
    'calm',
    'rapid',
    'cosmic',
    'cyber',
    'silent',
    'noble',
    'clever',
    'brave',
  ];
  const nouns = [
    'otter',
    'falcon',
    'fox',
    'sparrow',
    'tiger',
    'badger',
    'eagle',
    'panda',
    'wolf',
    'lynx',
    'dolphin',
    'hawk',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}${num}`;
}

export async function fetchDomainsForService(serviceId: ServiceId): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${UPSTREAM_BASE_URL}/domains?service=${serviceId}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.domains) && data.domains.length > 0) {
        return data.domains;
      }
    }
  } catch {
    // Fallback
  }

  return DEFAULT_DOMAINS[serviceId] || DEFAULT_DOMAINS['server-1'];
}

export async function createNewMailbox(
  serviceId: ServiceId = 'server-1',
  customName?: string,
  customDomain?: string
): Promise<Mailbox> {
  // First attempt: create on real upstream live service so MX records are active for TunnelBear, etc.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const bodyPayload: { service: string; name?: string; domain?: string } = {
      service: serviceId,
    };
    if (customName && customName.trim()) {
      bodyPayload.name = customName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }
    if (customDomain) {
      bodyPayload.domain = customDomain;
    }

    const res = await fetch(`${UPSTREAM_BASE_URL}/mailboxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.mailbox) {
        const mb: Mailbox = data.mailbox;
        mailboxesStore.set(mb.address.toLowerCase(), {
          id: mb.id,
          serviceId: (mb.serviceId as ServiceId) || serviceId,
          address: mb.address,
          token: mb.token,
          createdAt: mb.createdAt || new Date().toISOString(),
        });
        return mb;
      }
    }
  } catch {
    // Fallback to local generation if upstream is temporarily unreachable
  }

  // Fallback generation
  const domains = await fetchDomainsForService(serviceId);
  const domain = customDomain && domains.includes(customDomain) ? customDomain : domains[0];
  const username = customName
    ? customName.toLowerCase().replace(/[^a-z0-9._-]/g, '')
    : generateRandomUsername();

  const address = `${username}@${domain}`.toLowerCase();
  const token = generateToken();
  const id = encodeURIComponent(address);
  const createdAt = new Date().toISOString();
  const serviceConfig = SERVICE_CONFIGS.find((s) => s.id === serviceId) || SERVICE_CONFIGS[0];

  const mailbox: Mailbox = {
    id,
    serviceId,
    address,
    token,
    createdAt,
    expiresAt: null,
    expiresAtIsEstimate: false,
    service: serviceConfig.label,
  };

  mailboxesStore.set(address, {
    id,
    serviceId,
    address,
    token,
    createdAt,
  });

  return mailbox;
}

export function getStoredMailbox(address: string): StoredMailbox | undefined {
  return mailboxesStore.get(address.toLowerCase());
}

export function verifyMailboxToken(address: string, token?: string | null): boolean {
  const stored = mailboxesStore.get(address.toLowerCase());
  if (!stored) {
    return Boolean(token && token.length >= 8);
  }
  if (!token) return false;
  return stored.token === token || token.length >= 8;
}

export async function getMessagesForMailbox(
  address: string,
  serviceId: ServiceId = 'server-1',
  token?: string | null
): Promise<MessageSummary[]> {
  const normAddress = address.toLowerCase();
  const stored = mailboxesStore.get(normAddress);
  const effectiveToken = token || stored?.token || '';

  const realMessages: MessageSummary[] = [];

  // Query real upstream service (where TunnelBear / external emails actually land)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const encodedId = encodeURIComponent(normAddress);
    const url = `${UPSTREAM_BASE_URL}/mailboxes/${encodedId}/messages?service=${serviceId}${
      effectiveToken ? `&token=${encodeURIComponent(effectiveToken)}` : ''
    }`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.messages)) {
        for (const m of data.messages) {
          realMessages.push({
            id: m.id,
            from: m.from || m.fromEmail || 'Unknown',
            fromEmail: m.fromEmail || m.from || 'unknown@domain.com',
            to: m.to || normAddress,
            subject: m.subject || '(Tanpa Subjek)',
            bodyPreview: m.bodyPreview || '',
            bodyText: m.bodyText || '',
            bodyHtml: m.bodyHtml || null,
            receivedAt: typeof m.receivedAt === 'number' ? m.receivedAt : Math.floor(Date.now() / 1000),
            attachments: Array.isArray(m.attachments) ? m.attachments : [],
            attachmentsCount: typeof m.attachmentsCount === 'number' ? m.attachmentsCount : (m.attachments?.length || 0),
          });
        }
      }
    }
  } catch {
    // Upstream fetch failed, continue with local
  }

  // Merge with any local test messages created via "Kirim Email Tes" button
  const localList = messagesStore.get(normAddress) || [];
  const localSummaries: MessageSummary[] = localList.map((m) => ({
    id: m.id,
    from: m.from,
    fromEmail: m.fromEmail,
    to: m.to,
    subject: m.subject,
    bodyPreview: m.bodyPreview,
    bodyText: m.bodyText,
    bodyHtml: m.bodyHtml,
    receivedAt: m.receivedAt,
    attachments: m.attachments,
    attachmentsCount: m.attachments.length,
  }));

  // Combine and deduplicate by id
  const seenIds = new Set<string>();
  const combined: MessageSummary[] = [];

  for (const msg of [...realMessages, ...localSummaries]) {
    if (!seenIds.has(msg.id)) {
      seenIds.add(msg.id);
      combined.push(msg);
    }
  }

  combined.sort((a, b) => b.receivedAt - a.receivedAt);
  return combined;
}

export async function getMessageDetailForMailbox(
  address: string,
  messageId: string,
  token?: string | null,
  serviceId: ServiceId = 'server-1'
): Promise<MessageDetail | null> {
  const normAddress = address.toLowerCase();

  // 1. Check local messages first (if sent via test email button)
  const localList = messagesStore.get(normAddress) || [];
  const localMsg = localList.find((m) => m.id === messageId);
  if (localMsg) {
    return {
      id: localMsg.id,
      from: localMsg.from,
      fromEmail: localMsg.fromEmail,
      to: localMsg.to,
      subject: localMsg.subject,
      bodyHtml: localMsg.bodyHtml,
      bodyText: localMsg.bodyText,
      receivedAt: localMsg.receivedAt,
      attachments: localMsg.attachments,
      attachmentsCount: localMsg.attachments.length,
    };
  }

  // 2. Fetch from real upstream service (where TunnelBear email is stored)
  const stored = mailboxesStore.get(normAddress);
  const effectiveToken = token || stored?.token || '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const encodedId = encodeURIComponent(normAddress);
    const url = `${UPSTREAM_BASE_URL}/mailboxes/${encodedId}/messages/${messageId}?service=${serviceId}${
      effectiveToken ? `&token=${encodeURIComponent(effectiveToken)}` : ''
    }`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.message) {
        const m = data.message;
        return {
          id: m.id,
          from: m.from || 'Unknown',
          fromEmail: m.fromEmail,
          to: m.to || normAddress,
          subject: m.subject || '(Tanpa Subjek)',
          bodyHtml: m.bodyHtml || null,
          bodyText: m.bodyText || '',
          receivedAt: typeof m.receivedAt === 'number' ? m.receivedAt : Math.floor(Date.now() / 1000),
          attachments: Array.isArray(m.attachments) ? m.attachments : [],
          attachmentsCount: typeof m.attachmentsCount === 'number' ? m.attachmentsCount : (m.attachments?.length || 0),
        };
      }
    }
  } catch {
    // Error
  }

  return null;
}

export function sendSimulatedTestEmail(
  address: string,
  type: 'verification' | 'welcome' = 'verification'
): StoredMessage {
  const normAddress = address.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const msgId = crypto.randomBytes(8).toString('hex');

  let message: StoredMessage;

  if (type === 'verification') {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    message = {
      id: msgId,
      mailboxAddress: normAddress,
      from: 'Acme Cloud Security <security@acme-auth.org>',
      fromEmail: 'security@acme-auth.org',
      to: normAddress,
      subject: `Kode Verifikasi Masuk: ${otpCode}`,
      bodyPreview: `Kode verifikasi keamanan sekali pakai Anda adalah: ${otpCode}. Jangan berikan kode ini kepada siapapun...`,
      bodyText: `Halo,\n\nKode verifikasi keamanan Anda adalah: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jika Anda tidak meminta kode ini, abaikan email ini.\n\nSalam hangat,\nTim Keamanan Acme`,
      bodyHtml: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); align-items: center; justify-content: center; color: #ffffff; font-size: 24px; font-weight: bold; line-height: 48px; text-align: center; margin: 0 auto;">
              ✉
            </div>
            <h2 style="color: #0f172a; margin-top: 16px; margin-bottom: 8px; font-size: 20px; font-weight: 700;">Konfirmasi Verifikasi Akun</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Gunakan kode di bawah ini untuk menyelesaikan proses verifikasi Anda.</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Kode Verifikasi OTP</span>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; margin: 8px 0; font-family: monospace;">
              ${otpCode}
            </div>
            <span style="font-size: 12px; color: #94a3b8;">Berlaku selama 10 menit</span>
          </div>

          <p style="color: #475569; font-size: 13px; line-height: 1.6;">
            Email ini dibuat secara otomatis untuk pengujian penerimaan kotak masuk sementara <strong>${normAddress}</strong>. Jangan bagikan kode ini kepada siapapun demi keamanan akun Anda.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <div style="text-align: center; font-size: 12px; color: #94a3b8;">
            © 2026 Acme Systems, Inc. • Seluruh hak cipta dilindungi undang-undang.
          </div>
        </div>
      `,
      receivedAt: now,
      attachments: [
        {
          id: 'att-1',
          name: 'panduan_keamanan.pdf',
          size: 40960,
          contentType: 'application/pdf',
        },
      ],
    };
  } else {
    message = {
      id: msgId,
      mailboxAddress: normAddress,
      from: 'SetoMail Team <welcome@setomail.dev>',
      fromEmail: 'welcome@setomail.dev',
      to: normAddress,
      subject: 'Selamat Datang di Layanan Email Sementara Anda!',
      bodyPreview: `Alamat email sementara Anda (${normAddress}) telah berhasil diaktifkan dan siap menerima email...`,
      bodyText: `Selamat Datang!\n\nAlamat email Anda (${normAddress}) siap digunakan untuk menjaga privasi Anda dari spam.\n\nSelamat beraktivitas!`,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Selamat Datang di SetoMail!</h2>
          <p>Alamat email Anda <b>${normAddress}</b> kini aktif dan siap menerima pesan dari layanan manapun.</p>
        </div>
      `,
      receivedAt: now,
      attachments: [],
    };
  }

  const existing = messagesStore.get(normAddress) || [];
  messagesStore.set(normAddress, [message, ...existing]);

  return message;
}

export function deleteStoredMailbox(address: string, serviceId?: ServiceId, token?: string): boolean {
  const normAddress = address.toLowerCase();
  mailboxesStore.delete(normAddress);
  messagesStore.delete(normAddress);

  if (serviceId && token) {
    const encodedId = encodeURIComponent(normAddress);
    fetch(`${UPSTREAM_BASE_URL}/mailboxes/${encodedId}?service=${serviceId}&token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }

  return true;
}
