'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Paperclip,
  Download,
  Trash2,
  KeyRound,
  FileText,
  Code,
  Loader2,
} from 'lucide-react';
import { Mailbox, MessageDetail, MessageSummary } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface MessageDrawerProps {
  mailbox: Mailbox;
  messageSummary: MessageSummary | null;
  lang: Language;
  onClose: () => void;
  onDeleteMessage: (msgId: string) => void;
}

export const MessageDrawer: React.FC<MessageDrawerProps> = ({
  mailbox,
  messageSummary,
  lang,
  onClose,
  onDeleteMessage,
}) => {
  const t = translations[lang];

  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch full message detail whenever messageSummary changes
  useEffect(() => {
    if (!messageSummary) {
      setDetail(null);
      return;
    }

    setLoading(true);
    fetch(
      `/api/mailboxes/${mailbox.id}/messages/${messageSummary.id}?service=${mailbox.serviceId}&token=${encodeURIComponent(
        mailbox.token
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.message) {
          setDetail(data.message);
          setViewMode(data.message.bodyHtml ? 'html' : 'text');
        } else {
          // Fallback from summary
          setDetail({
            id: messageSummary.id,
            from: messageSummary.from,
            fromEmail: messageSummary.fromEmail,
            to: messageSummary.to || mailbox.address,
            subject: messageSummary.subject,
            bodyHtml: messageSummary.bodyHtml || null,
            bodyText: messageSummary.bodyText || messageSummary.bodyPreview,
            receivedAt: messageSummary.receivedAt,
            attachments: messageSummary.attachments,
            attachmentsCount: messageSummary.attachmentsCount,
          });
        }
      })
      .catch(() => {
        // Fallback
        setDetail({
          id: messageSummary.id,
          from: messageSummary.from,
          fromEmail: messageSummary.fromEmail,
          to: messageSummary.to || mailbox.address,
          subject: messageSummary.subject,
          bodyHtml: messageSummary.bodyHtml || null,
          bodyText: messageSummary.bodyText || messageSummary.bodyPreview,
          receivedAt: messageSummary.receivedAt,
          attachments: messageSummary.attachments,
          attachmentsCount: messageSummary.attachmentsCount,
        });
      })
      .finally(() => setLoading(false));
  }, [messageSummary, mailbox.id, mailbox.serviceId, mailbox.token, mailbox.address]);

  if (!messageSummary) return null;

  // Detect verification code or OTP in bodyText or subject
  const textToScan = `${messageSummary.subject} ${detail?.bodyText || messageSummary.bodyPreview}`;
  const otpMatch = textToScan.match(/\b([0-9]{4,8})\b/);
  const detectedOtp = otpMatch ? otpMatch[1] : null;

  const handleCopyOtp = async () => {
    if (!detectedOtp) return;
    try {
      await navigator.clipboard.writeText(detectedOtp);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="break-words text-lg font-bold text-slate-900 sm:text-xl">
              {detail?.subject || messageSummary.subject || t.no_subject}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">{t.message_from}:</span>{' '}
                {detail?.from || messageSummary.from}
              </div>
              <div>
                <span className="font-semibold text-slate-700">{t.message_date}:</span>{' '}
                {new Date(messageSummary.receivedAt * 1000).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verification Code Highlight Banner */}
        {detectedOtp && (
          <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-900">
                {t.verification_code_found}:
              </span>
              <span className="font-mono text-sm font-extrabold text-indigo-700">
                {detectedOtp}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyOtp}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? t.copied : t.copy_code}</span>
            </button>
          </div>
        )}

        {/* Tab Switcher: HTML vs Plain Text */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('html')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'html'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>{t.view_html}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'text'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{t.view_text}</span>
            </button>
          </div>

          {/* Delete Message Button */}
          <button
            type="button"
            onClick={() => {
              onDeleteMessage(messageSummary.id);
              onClose();
            }}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.delete_message}</span>
          </button>
        </div>

        {/* Message Content Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <span>Memuat pesan…</span>
            </div>
          ) : viewMode === 'html' && detail?.bodyHtml ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <iframe
                title="Email HTML Preview"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><base target="_blank"/><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:16px;color:#1e293b;line-height:1.6;}img{max-width:100%;height:auto;}</style></head><body>${detail.bodyHtml}</body></html>`}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                className="h-[400px] w-full border-0 bg-white"
              />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {detail?.bodyText || messageSummary.bodyPreview || '(Konten email kosong)'}
            </pre>
          )}

          {/* Attachments Section */}
          {detail && detail.attachments && detail.attachments.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{t.attachments} ({detail.attachments.length})</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {detail.attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold text-slate-800">{att.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {(att.size / 1024).toFixed(1)} KB • {att.contentType}
                      </p>
                    </div>

                    <a
                      href={att.url || '#'}
                      download={att.name}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
