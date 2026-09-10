export type ServiceId = 'server-1' | 'server-2' | 'server-3' | 'gmail';

export interface ServiceConfig {
  id: ServiceId;
  label: string;
  description: string;
  supportsCustomName: boolean;
  supportsDomainPick: boolean;
  requiresTokenForRead: boolean;
  ttlLabel: string | null;
  enabled: boolean;
}

export interface Mailbox {
  id: string; // URL encoded address, e.g. user%40domain.com
  serviceId: ServiceId;
  address: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  expiresAtIsEstimate: boolean;
  service: string;
}

export interface Attachment {
  id?: string;
  name: string;
  size: number;
  contentType: string;
  url?: string;
}

export interface MessageSummary {
  id: string;
  from: string;
  fromEmail: string;
  to?: string | null;
  subject: string;
  bodyPreview: string;
  bodyText?: string;
  bodyHtml?: string | null;
  receivedAt: number; // Unix timestamp in seconds
  attachments: Attachment[];
  attachmentsCount: number;
}

export interface MessageDetail {
  id: string;
  from: string;
  fromEmail?: string;
  to?: string;
  subject: string;
  bodyHtml: string | null;
  bodyText: string;
  receivedAt: number;
  attachments: Attachment[];
  attachmentsCount: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
  [key: string]: unknown;
}
