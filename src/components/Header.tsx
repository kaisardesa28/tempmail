'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, BookOpen, Home } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageChange }) => {
  const pathname = usePathname();
  const t = translations[lang];

  const isHome = pathname === '/' || pathname.startsWith('/share');
  const isDocs = pathname === '/docs';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30 transition-transform group-hover:scale-105">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              className="text-white"
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
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Seto<span className="text-indigo-600">Mail</span>
          </span>
        </Link>

        {/* Navigation & Language */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isHome
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">{t.home}</span>
          </Link>

          <Link
            href="/docs"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isDocs
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t.docs}</span>
          </Link>

          {/* Language Switcher */}
          <div
            className="ml-1 sm:ml-2 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            title={t.language}
          >
            <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onLanguageChange('id')}
              className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                lang === 'id'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
