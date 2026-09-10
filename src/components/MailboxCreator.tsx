'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Dices, Mail, Loader2 } from 'lucide-react';
import { Mailbox, ServiceConfig, ServiceId } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { generateRandomUsername } from '@/lib/email-service';

interface MailboxCreatorProps {
  lang: Language;
  onCreated: (mailbox: Mailbox) => void;
  defaultService?: ServiceId;
}

export const MailboxCreator: React.FC<MailboxCreatorProps> = ({
  lang,
  onCreated,
  defaultService = 'server-1',
}) => {
  const t = translations[lang];

  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceId>(defaultService);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration and services
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.services) {
          setServices(data.services);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, []);

  // Load domains when selectedService changes
  useEffect(() => {
    fetch(`/api/domains?service=${selectedService}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.domains?.length) {
          setDomains(data.domains);
          setSelectedDomain(data.domains[0]);
        } else {
          setDomains([]);
        }
      })
      .catch(() => setDomains([]));
  }, [selectedService]);

  // Set random username initially
  useEffect(() => {
    setUsername(generateRandomUsername());
  }, []);

  const currentServiceConfig = services.find((s) => s.id === selectedService);
  const supportsCustom = currentServiceConfig?.supportsCustomName ?? true;

  const handleRandomize = () => {
    setUsername(generateRandomUsername());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: { service: ServiceId; name?: string; domain?: string } = {
        service: selectedService,
      };

      if (supportsCustom && username.trim()) {
        payload.name = username.trim().toLowerCase();
      }
      if (selectedDomain) {
        payload.domain = selectedDomain;
      }

      const res = await fetch('/api/mailboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || 'Gagal membuat mailbox.');
      }

      onCreated(data.mailbox);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat email.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig && services.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-xl shadow-indigo-600/5">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        <span>{t.create_submitting}</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-600/5 transition-all sm:p-8">
      {/* Service Selector Tabs */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
          {t.choose_service}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(services.length > 0
            ? services
            : [
                { id: 'server-1', label: 'Server 1', enabled: true },
                { id: 'server-2', label: 'Server 2', enabled: true },
                { id: 'server-3', label: 'Server 3', enabled: true },
                { id: 'gmail', label: 'Gmail', enabled: true },
              ]
          ).map((s) => {
            const isSelected = selectedService === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedService(s.id as ServiceId)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <span className="text-xs font-bold">{s.label}</span>
                <span
                  className={`mt-0.5 text-[10px] font-medium ${
                    isSelected ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {s.id === 'server-1'
                    ? t.server_1_badge
                    : s.id === 'server-2'
                    ? t.server_2_badge
                    : s.id === 'server-3'
                    ? t.server_3_badge
                    : t.gmail_badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        {supportsCustom ? (
          <div className="grid gap-3 sm:grid-cols-12">
            {/* Username Field */}
            <div className="sm:col-span-7">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {t.username_label}
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.username_placeholder}
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  pattern="[a-zA-Z0-9._-]+"
                  required
                />
                <button
                  type="button"
                  onClick={handleRandomize}
                  title="Acak nama pengguna"
                  className="flex items-center gap-1 border-l border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Dices className="h-4 w-4" />
                  <span>{t.random_btn}</span>
                </button>
              </div>
            </div>

            {/* Domain Dropdown */}
            <div className="sm:col-span-5">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {t.domain_label}
              </label>
              <div className="relative">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                >
                  {domains.map((dom) => (
                    <option key={dom} value={dom}>
                      @{dom}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center text-xs text-indigo-700">
            <Sparkles className="mx-auto mb-1.5 h-5 w-5 text-indigo-500" />
            <p>{t.auto_generate_hint}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.create_submitting}</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>{t.create_submit}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
