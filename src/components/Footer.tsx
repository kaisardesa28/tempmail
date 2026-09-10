'use client';

import React from 'react';
import Link from 'next/link';
import { translations, Language } from '@/lib/i18n';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            className="text-indigo-600"
          >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path
              d="m6 9 6 4 6-4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6 17h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>
            <strong className="font-semibold text-slate-700">PakMail</strong> — {t.footer_text}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <Link href="/docs" className="transition-colors hover:text-indigo-600">
            {t.docs}
          </Link>
          <span className="text-slate-300">•</span>
          <span>{t.footer_disclaimer}</span>
        </div>
      </div>
    </footer>
  );
};
