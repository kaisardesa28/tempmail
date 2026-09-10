'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Mailbox } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface QrCodeModalProps {
  mailbox: Mailbox;
  lang: Language;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ mailbox, lang, onClose }) => {
  const t = translations[lang];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      mailbox.address,
      {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [mailbox.address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mailbox.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <QrCode className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">{t.qr_modal_title}</h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{t.qr_modal_desc}</p>

        {/* QR Image Canvas */}
        <div className="my-5 flex items-center justify-center">
          <div className="overflow-hidden rounded-2xl border-2 border-slate-100 p-2 shadow-inner bg-white">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR Code Email"
                className="h-48 w-48 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-400">
                Membuat QR Code…
              </div>
            )}
          </div>
        </div>

        {/* Email Address & Copy */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
          <span className="truncate font-mono font-medium text-slate-700">{mailbox.address}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white transition hover:bg-indigo-700"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? t.copied : t.copy_address}</span>
          </button>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {t.done}
        </button>
      </div>
    </div>
  );
};
