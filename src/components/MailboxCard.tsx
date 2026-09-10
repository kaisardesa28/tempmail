'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy,
  Check,
  RotateCw,
  PlusCircle,
  QrCode,
  Share2,
  Trash2,
  Send,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Mailbox } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface MailboxCardProps {
  mailbox: Mailbox;
  lang: Language;
  onRefresh: () => Promise<void>;
  onNew: () => void;
  onDelete: () => void;
  onShowQr: () => void;
  onShowShare: () => void;
  onSendTestEmail: () => Promise<void>;
  isRefreshing: boolean;
}

const REFRESH_INTERVAL_SEC = 15;

export const MailboxCard: React.FC<MailboxCardProps> = ({
  mailbox,
  lang,
  onRefresh,
  onNew,
  onDelete,
  onShowQr,
  onShowShare,
  onSendTestEmail,
  isRefreshing,
}) => {
  const t = translations[lang];

  const [copied, setCopied] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [savingToAdmin, setSavingToAdmin] = useState(false);
  const [savedToAdmin, setSavedToAdmin] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC);
  const [isTabActive, setIsTabActive] = useState(true);

  // Stable callback for refresh to avoid interval recreation
  const handleRefresh = useCallback(async () => {
    setCountdown(REFRESH_INTERVAL_SEC);
    await onRefresh();
  }, [onRefresh]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Countdown and auto-refresh timer
  const handleRefreshRef = useRef(handleRefresh);
  useEffect(() => {
    handleRefreshRef.current = handleRefresh;
  }, [handleRefresh]);

  useEffect(() => {
    if (!isTabActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefreshRef.current();
          return REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTabActive]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mailbox.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = mailbox.address;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await onSendTestEmail();
      setCountdown(REFRESH_INTERVAL_SEC);
    } finally {
      setSendingTest(false);
    }
  };

  const handleSaveToAdmin = async () => {
    const label = window.prompt(
      lang === 'id'
        ? 'Beri label / nama akun ini untuk disimpan di dashboard Admin:'
        : 'Enter a label / account name to save in the Admin dashboard:',
      'Akun Pantauan'
    );
    if (label === null) return;

    setSavingToAdmin(true);
    try {
      const res = await fetch('/api/admin/mailboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'setomail2026',
        },
        body: JSON.stringify({
          address: mailbox.address,
          token: mailbox.token,
          serviceId: mailbox.serviceId,
          label: label || 'Akun Pantauan',
          adminPassword: 'setomail2026',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedToAdmin(true);
        setTimeout(() => setSavedToAdmin(false), 3000);
      } else {
        alert(data.error?.message || 'Gagal menyimpan ke admin.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setSavingToAdmin(false);
    }
  };

  const progressPercent = ((REFRESH_INTERVAL_SEC - countdown) / REFRESH_INTERVAL_SEC) * 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-600/5 transition-all sm:p-6">
      {/* Top Header: Badge & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {mailbox.service || 'Server 1'}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(mailbox.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Auto Refresh Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {isTabActive ? (
            <span>{t.auto_refresh_in.replace('{sec}', countdown.toString())}</span>
          ) : (
            <span className="text-amber-500">{t.auto_refresh_paused}</span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={t.refresh_now}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Email Address Display */}
      <div className="py-4 text-center sm:py-5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {t.active_address_title}
        </span>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <h2 className="break-all font-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
            {mailbox.address}
          </h2>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {/* Copy Address Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? t.copied : t.copy_address}</span>
        </button>

        {/* Change / New Button */}
        <button
          type="button"
          onClick={onNew}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          <PlusCircle className="h-4 w-4 text-slate-500" />
          <span>{t.new_address}</span>
        </button>

        {/* QR Code Button */}
        <button
          type="button"
          onClick={onShowQr}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          <QrCode className="h-4 w-4 text-slate-500" />
          <span>{t.qr_code}</span>
        </button>

        {/* Share Link Button */}
        <button
          type="button"
          onClick={onShowShare}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          <Share2 className="h-4 w-4 text-slate-500" />
          <span>{t.share_link}</span>
        </button>

        {/* Save to Admin Button */}
        <button
          type="button"
          onClick={handleSaveToAdmin}
          disabled={savingToAdmin}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
            savedToAdmin
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100/70'
          }`}
          title="Simpan email ini ke Dashboard Admin agar bisa diakses terus-menerus"
        >
          {savedToAdmin ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-emerald-600" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 text-indigo-600" />
              <span>Simpan Admin</span>
            </>
          )}
        </button>

        {/* Send Test Email Button */}
        <button
          type="button"
          onClick={handleSendTest}
          disabled={sendingTest}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 active:scale-95 disabled:opacity-60"
          title="Kirim email verifikasi OTP untuk menguji inbox seketika"
        >
          {sendingTest ? <Loader2 className="h-4 w-4 animate-spin text-amber-700" /> : <Send className="h-4 w-4 text-amber-700" />}
          <span>{t.send_test_email}</span>
        </button>

        {/* Delete Mailbox Button */}
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95"
        >
          <Trash2 className="h-4 w-4 text-rose-600" />
          <span>{t.delete_mailbox}</span>
        </button>
      </div>
    </div>
  );
};
