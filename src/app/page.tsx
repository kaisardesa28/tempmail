'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MailboxCreator } from '@/components/MailboxCreator';
import { MailboxCard } from '@/components/MailboxCard';
import { InboxList } from '@/components/InboxList';
import { MessageDrawer } from '@/components/MessageDrawer';
import { QrCodeModal } from '@/components/QrCodeModal';
import { ShareModal } from '@/components/ShareModal';
import { FeatureSections } from '@/components/FeatureSections';
import { Mailbox, MessageSummary } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { Zap, ShieldCheck } from 'lucide-react';

const STORAGE_MAILBOX_KEY = 'setomail_current_mailbox';
const STORAGE_LANG_KEY = 'setomail_lang';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('id');
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = translations[lang];

  // Load language and active mailbox from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY) as Language;
      if (savedLang === 'id' || savedLang === 'en') {
        setLang(savedLang);
      }
      const savedMailbox = localStorage.getItem(STORAGE_MAILBOX_KEY);
      if (savedMailbox) {
        setMailbox(JSON.parse(savedMailbox));
      }
    } catch {
      // Ignore localStorage error
    }
    setMounted(true);
  }, []);

  // Save language changes
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {}
  };

  // Save mailbox changes
  const saveMailbox = (mb: Mailbox | null) => {
    setMailbox(mb);
    try {
      if (mb) {
        localStorage.setItem(STORAGE_MAILBOX_KEY, JSON.stringify(mb));
      } else {
        localStorage.removeItem(STORAGE_MAILBOX_KEY);
      }
    } catch {}
  };

  // Fetch messages for active mailbox
  const fetchMessages = useCallback(async () => {
    if (!mailbox) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/mailboxes/${mailbox.id}/messages?service=${mailbox.serviceId}&token=${encodeURIComponent(
          mailbox.token
        )}`
      );
      const data = await res.json();
      if (data.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Ignore network errors during polling
    } finally {
      setIsRefreshing(false);
    }
  }, [mailbox]);

  // Trigger fetch messages whenever active mailbox changes
  useEffect(() => {
    if (mailbox) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [mailbox, fetchMessages]);

  const handleMailboxCreated = (newMb: Mailbox) => {
    saveMailbox(newMb);
    setIsCreatorOpen(false);
  };

  const handleDeleteMailbox = () => {
    if (!mailbox) return;
    if (window.confirm(t.delete_confirm)) {
      fetch(`/api/mailboxes/${mailbox.id}?service=${mailbox.serviceId}`, {
        method: 'DELETE',
      }).catch(() => {});
      saveMailbox(null);
      setMessages([]);
      setSelectedMessage(null);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handleSendTestEmail = async () => {
    if (!mailbox) return;
    try {
      const res = await fetch(`/api/mailboxes/${mailbox.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verification' }),
      });
      const data = await res.json();
      if (data.ok) {
        await fetchMessages();
      }
    } catch {
      // Error handling
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="h-16 border-b border-slate-200/70 bg-white/80" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />

      <main className="mx-auto flex-1 max-w-5xl px-4 pb-12 sm:px-6 w-full">
        {/* Hero Section */}
        <section className="pb-8 pt-8 text-center sm:pt-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
            <Zap className="h-3.5 w-3.5" />
            {t.badge}
          </span>

          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {t.hero_title_1}{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {t.hero_title_2}
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-500 sm:text-base">
            {t.hero_subtitle}
          </p>
        </section>

        {/* Mailbox Section */}
        <div className="mx-auto max-w-2xl">
          {!mailbox || isCreatorOpen ? (
            <div className="space-y-4">
              <MailboxCreator
                lang={lang}
                onCreated={handleMailboxCreated}
                defaultService={mailbox?.serviceId || 'server-1'}
              />
              {mailbox && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsCreatorOpen(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
                  >
                    Batal dan kembali ke alamat aktif
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <MailboxCard
                mailbox={mailbox}
                lang={lang}
                onRefresh={fetchMessages}
                onNew={() => setIsCreatorOpen(true)}
                onDelete={handleDeleteMailbox}
                onShowQr={() => setShowQrModal(true)}
                onShowShare={() => setShowShareModal(true)}
                onSendTestEmail={handleSendTestEmail}
                isRefreshing={isRefreshing}
              />

              {/* Inbox list */}
              <InboxList
                messages={messages}
                lang={lang}
                onSelectMessage={(msg) => setSelectedMessage(msg)}
                isLoading={isRefreshing}
              />
            </div>
          )}
        </div>

        {/* Security / Privacy Warning */}
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{t.security_note}</span>
        </p>

        {/* Informational Feature Sections */}
        <FeatureSections lang={lang} />
      </main>

      {/* Message Detail Drawer / Modal */}
      {mailbox && selectedMessage && (
        <MessageDrawer
          mailbox={mailbox}
          messageSummary={selectedMessage}
          lang={lang}
          onClose={() => setSelectedMessage(null)}
          onDeleteMessage={handleDeleteMessage}
        />
      )}

      {/* QR Code Modal */}
      {mailbox && showQrModal && (
        <QrCodeModal
          mailbox={mailbox}
          lang={lang}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Share Mailbox Modal */}
      {mailbox && showShareModal && (
        <ShareModal
          mailbox={mailbox}
          lang={lang}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <Footer lang={lang} />
    </div>
  );
}
