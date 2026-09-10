'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, ShieldAlert } from 'lucide-react';
import { Mailbox } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface ShareModalProps {
  mailbox: Mailbox;
  lang: Language;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ mailbox, lang, onClose }) => {
  const t = translations[lang];
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parts = mailbox.address.split('@');
    const name = parts[0] || 'mailbox';
    const domain = parts[1] || 'domain.com';
    const origin = window.location.origin;

    const url = `${origin}/share/${domain}/${name}?t=${encodeURIComponent(mailbox.token)}`;
    setShareUrl(url);
  }, [mailbox.address, mailbox.token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.share_modal_title}</h3>
            <p className="text-xs text-slate-500">{t.share_modal_desc}</p>
          </div>
        </div>

        {/* Share URL Input & Copy */}
        <div className="my-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.share_url_label}
          </label>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent px-2 text-xs font-mono text-slate-700 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t.copied : t.copy_address}</span>
            </button>
          </div>
        </div>

        {/* Security Alert Note */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="leading-relaxed">{t.share_hint}</p>
        </div>

        {/* Close Button */}
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
