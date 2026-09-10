'use client';

import React from 'react';
import { Mail, Inbox, Paperclip, ChevronRight, Clock } from 'lucide-react';
import { MessageSummary } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';

interface InboxListProps {
  messages: MessageSummary[];
  lang: Language;
  onSelectMessage: (msg: MessageSummary) => void;
  isLoading: boolean;
}

export const InboxList: React.FC<InboxListProps> = ({
  messages,
  lang,
  onSelectMessage,
  isLoading,
}) => {
  const t = translations[lang];

  // Helper for human-readable relative time
  const formatTimeAgo = (timestampSec: number) => {
    const diff = Math.floor(Date.now() / 1000) - timestampSec;
    if (diff < 30) return t.just_now;
    if (diff < 3600) {
      const min = Math.max(1, Math.floor(diff / 60));
      return t.minutes_ago.replace('{min}', min.toString());
    }
    if (diff < 86400) {
      const hr = Math.floor(diff / 3600);
      return t.hours_ago.replace('{hr}', hr.toString());
    }
    const d = Math.floor(diff / 86400);
    return t.days_ago.replace('{d}', d.toString());
  };

  // Helper for avatar initial
  const getInitial = (from: string) => {
    const clean = from.replace(/<.*?>/, '').trim();
    return clean ? clean.charAt(0).toUpperCase() : 'M';
  };

  return (
    <div className="mt-8">
      {/* Section Title & Counter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{t.inbox_title}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-bold text-indigo-700">
            {messages.length}
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        /* Empty Inbox State */
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Mail className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-indigo-600" />
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900">{t.inbox_empty_title}</h4>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
            {t.inbox_empty_desc}
          </p>
        </div>
      ) : (
        /* Message Cards List */
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className="group flex cursor-pointer items-center justify-between gap-3 p-4 transition-all hover:bg-indigo-50/40 sm:p-5"
            >
              {/* Left Avatar Initial */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                {getInitial(msg.from)}
              </div>

              {/* Message Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                    {msg.from.replace(/<.*?>/, '').trim() || msg.fromEmail}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(msg.receivedAt)}
                  </span>
                </div>

                <h5 className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                  {msg.subject || t.no_subject}
                </h5>

                <p className="truncate text-xs text-slate-500">
                  {msg.bodyPreview || '(Isi pesan kosong)'}
                </p>

                {/* Attachments Pill if any */}
                {msg.attachmentsCount > 0 && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      <Paperclip className="h-3 w-3" />
                      {t.attachments_count.replace('{count}', msg.attachmentsCount.toString())}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Arrow Indicator */}
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
