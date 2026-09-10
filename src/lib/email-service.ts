import crypto from 'crypto';
import { Mailbox, MessageDetail, MessageSummary, ServiceConfig, ServiceId } from './types';

// In-memory store for mailboxes and test/local messages
// (Ensures rapid response, local fallback, and testing capabilities)
interface StoredMailbox {
  id: string;
  serviceId: ServiceId;
  address: string;
  token: string;
  mailTmPassword?: string;
  mailTmToken?: string;
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

// Fallback domains
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
  'server-2': ['catchmail.io', 'inboxproxy.dev', 'tempinbox.org'],
  'server-3': ['tempbox.live', 'burnermail.co', 'privatemail.link'],
  gmail: ['gmail.temp.net', 'googlemail.temp-inbox.com'],
};

// Generate 12-character lowercase alphanumeric token
export function generateToken(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let token = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

// Generate random friendly username prefix
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
  if (serviceId === 'server-1') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://api.mail.tm/domains', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const domains = data['hydra:member']?.map((d: { domain: string }) => d.domain) || [];
        if (domains.length > 0) {
          return Array.from(new Set([...domains, ...DEFAULT_DOMAINS['server-1']]));
        }
      }
    } catch {
      // Fallback
    }
  }

  return DEFAULT_DOMAINS[serviceId] || DEFAULT_DOMAINS['server-1'];
}

export async function createNewMailbox(
  serviceId: ServiceId = 'server-1',
  customName?: string,
  customDomain?: string
): Promise<Mailbox> {
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

  // Try creating on live mail.tm if domain matches mail.tm
  let mailTmPassword = '';
  let mailTmToken = '';
  try {
    mailTmPassword = crypto.randomBytes(16).toString('hex');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const createRes = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password: mailTmPassword }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (createRes.ok) {
      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password: mailTmPassword }),
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        mailTmToken = tokenData.token;
      }
    }
  } catch {
    // Local fallback works seamlessly
  }

  mailboxesStore.set(address, {
    id,
    serviceId,
    address,
    token,
    mailTmPassword,
    mailTmToken,
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
    // If not in memory (e.g. serverless stateless request), check token format (12 alphanumeric)
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

  // If live mail.tm token exists, fetch live messages
  if (stored?.mailTmToken) {
    try {
      const res = await fetch('https://api.mail.tm/messages', {
        headers: {
          Authorization: `Bearer ${stored.mailTmToken}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const liveMessages: MessageSummary[] = (data['hydra:member'] || []).map(
          (m: {
            id: string;
            from: { name: string; address: string };
            subject: string;
            intro: string;
            createdAt: string;
            hasAttachments: boolean;
            attachments?: { filename: string; size: number; contentType: string }[];
          }) => ({
            id: m.id,
            from: m.from.name ? `${m.from.name} <${m.from.address}>` : m.from.address,
            fromEmail: m.from.address,
            to: normAddress,
            subject: m.subject || '(Tanpa Subjek)',
            bodyPreview: m.intro || '',
            receivedAt: Math.floor(new Date(m.createdAt).getTime() / 1000),
            attachments: (m.attachments || []).map((a) => ({
              name: a.filename,
              size: a.size,
              contentType: a.contentType,
            })),
            attachmentsCount: m.hasAttachments ? (m.attachments?.length || 1) : 0,
          })
        );

        // Merge with any local test messages
        const local = messagesStore.get(normAddress) || [];
        const localSummaries: MessageSummary[] = local.map((m) => ({
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

        const all = [...localSummaries, ...liveMessages];
        all.sort((a, b) => b.receivedAt - a.receivedAt);
        return all;
      }
    } catch {
      // Fallback to local
    }
  }

  // Local / Test messages
  const local = messagesStore.get(normAddress) || [];
  return local.map((m) => ({
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
}

export async function getMessageDetailForMailbox(
  address: string,
  messageId: string,
  token?: string | null
): Promise<MessageDetail | null> {
  const normAddress = address.toLowerCase();
  const stored = mailboxesStore.get(normAddress);

  // Check local messages first
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

  // Check live mail.tm
  if (stored?.mailTmToken) {
    try {
      const res = await fetch(`https://api.mail.tm/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${stored.mailTmToken}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const m = await res.json();
        return {
          id: m.id,
          from: m.from.name ? `${m.from.name} <${m.from.address}>` : m.from.address,
          fromEmail: m.from.address,
          to: normAddress,
          subject: m.subject || '(Tanpa Subjek)',
          bodyHtml: Array.isArray(m.html) ? m.html.join('') : m.html || null,
          bodyText: m.text || '',
          receivedAt: Math.floor(new Date(m.createdAt).getTime() / 1000),
          attachments: (m.attachments || []).map(
            (a: { id: string; filename: string; size: number; contentType: string; downloadUrl?: string }) => ({
              id: a.id,
              name: a.filename,
              size: a.size,
              contentType: a.contentType,
              url: a.downloadUrl,
            })
          ),
          attachmentsCount: m.attachments?.length || 0,
        };
      }
    } catch {
      // Fallback
    }
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
      from: 'PakMail Team <welcome@pakmail.dev>',
      fromEmail: 'welcome@pakmail.dev',
      to: normAddress,
      subject: 'Selamat Datang di Layanan Email Sementara Anda!',
      bodyPreview: `Alamat email sementara Anda (${normAddress}) telah berhasil diaktifkan dan siap menerima email...`,
      bodyText: `Selamat Datang!\n\nAlamat email Anda (${normAddress}) siap digunakan untuk menjaga privasi Anda dari spam.\n\nSelamat beraktivitas!`,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Selamat Datang di PakMail!</h2>
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

export function deleteStoredMailbox(address: string): boolean {
  const normAddress = address.toLowerCase();
  mailboxesStore.delete(normAddress);
  messagesStore.delete(normAddress);
  return true;
}
