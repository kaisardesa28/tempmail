'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Shield, Globe, Key, ArrowRight } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface FeatureSectionsProps {
  lang: Language;
}

export const FeatureSections: React.FC<FeatureSectionsProps> = ({ lang }) => {
  const t = translations[lang];

  const icons = [Zap, Shield, Globe, Key];

  return (
    <>
      {/* How it works Section */}
      <section className="mt-14">
        <h2 className="text-center text-xl font-bold text-slate-900">{t.features_how}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {t.steps.map((step, idx) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-600/30">
                {idx + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why SetoMail Section */}
      <section className="mt-12">
        <h2 className="text-center text-xl font-bold text-slate-900">{t.features_why}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {t.features_list.map((feat, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={feat.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Documentation Banner */}
      <section className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center text-white shadow-lg shadow-indigo-600/25 sm:p-8">
        <h2 className="text-lg font-bold sm:text-xl">{t.cta_title}</h2>
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-indigo-100">
          {t.cta_desc}
        </p>
        <Link
          href="/docs"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-transform hover:scale-[1.02] active:scale-95"
        >
          <span>{t.cta_btn}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
};
