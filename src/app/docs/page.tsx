'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Language } from '@/lib/i18n';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const STORAGE_LANG_KEY = 'pakmail_lang';

export default function DocsPage() {
  const [lang, setLang] = useState<Language>('id');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY) as Language;
      if (savedLang === 'id' || savedLang === 'en') {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {}
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://pakmail.vercel.app/api';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />

      <div className="mx-auto flex-1 max-w-5xl px-4 py-10 sm:px-6 w-full">
        {/* Header Title */}
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <ExternalLink className="h-3 w-3" />
            Public API
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {lang === 'id' ? 'Dokumentasi API PakMail' : 'PakMail Public API Documentation'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {lang === 'id'
              ? 'PakMail menyediakan API publik gratis untuk membuat alamat email sementara dan membaca pesan yang masuk. API ini adalah proxy tanpa status (stateless) — token disimpan di sisi klien Anda.'
              : 'PakMail provides a free public API to generate disposable email addresses and read incoming messages. This API is stateless — tokens are managed on the client side.'}
          </p>
        </header>

        {/* Layout Grid: Sidebar + Content */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'id' ? 'Daftar Isi' : 'Table of Contents'}
              </p>
              <ul className="space-y-0.5">
                <li>
                  <a href="#pengantar" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                    {lang === 'id' ? 'Pendahuluan' : 'Introduction'}
                  </a>
                </li>
                <li>
                  <a href="#mulai" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                    {lang === 'id' ? 'Memulai Cepat' : 'Quickstart'}
                  </a>
                </li>
                <li>
                  <a href="#auth" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                    {lang === 'id' ? 'Autentikasi' : 'Authentication'}
                  </a>
                </li>
                <li>
                  <a href="#endpoints" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 font-semibold">
                    {lang === 'id' ? 'Endpoint API' : 'API Endpoints'}
                  </a>
                </li>
                <li className="pl-2">
                  <a href="#mailboxes" className="block rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600">
                    POST /api/mailboxes
                  </a>
                </li>
                <li className="pl-2">
                  <a href="#messages" className="block rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600">
                    GET /api/mailboxes/:id/messages
                  </a>
                </li>
                <li className="pl-2">
                  <a href="#detail" className="block rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600">
                    GET .../messages/:messageId
                  </a>
                </li>
                <li className="pl-2">
                  <a href="#domains" className="block rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600">
                    GET /api/domains
                  </a>
                </li>
                <li className="pl-2">
                  <a href="#config" className="block rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600">
                    GET /api/config
                  </a>
                </li>
                <li>
                  <a href="#errors" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                    {lang === 'id' ? 'Kode Kesalahan' : 'Error Codes'}
                  </a>
                </li>
                <li>
                  <a href="#contoh" className="block rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 font-semibold">
                    {lang === 'id' ? 'Contoh Kode' : 'Code Examples'}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Docs Content */}
          <article className="min-w-0 space-y-12">
            {/* Base URL Section */}
            <section id="pengantar">
              <h2 className="text-xl font-bold text-slate-900">
                {lang === 'id' ? 'Pendahuluan & Base URL' : 'Introduction & Base URL'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {lang === 'id'
                  ? 'Semua endpoint berada di bawah base URL /api dan mengembalikan respon berformat JSON. Format respon sukses adalah { ok: true, ... }, sedangkan respon kesalahan berbentuk { ok: false, error: { code, message } }.'
                  : 'All endpoints reside under the /api base URL and return JSON. Successful responses contain { ok: true, ... }, while errors return { ok: false, error: { code, message } }.'}
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Base URL</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(baseUrl, 'base-url')}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    {copiedSection === 'base-url' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'base-url' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs font-mono text-indigo-300">
                  <code>{baseUrl}</code>
                </pre>
              </div>
            </section>

            {/* Quickstart Section */}
            <section id="mulai" className="scroll-mt-24 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900">
                {lang === 'id' ? 'Memulai Cepat' : 'Quickstart'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {lang === 'id' ? 'Cukup 2 langkah sederhana: buat mailbox lalu baca pesan masuk.' : 'Two simple steps: create a mailbox, then read incoming messages.'}
              </p>

              <div className="mt-4 space-y-4">
                {/* Step 1 cURL */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      1. cURL — Buat Mailbox Baru
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST ${baseUrl}/mailboxes \\\n  -H "Content-Type: application/json" \\\n  -d '{"service":"server-1"}'`,
                          'curl-create'
                        )
                      }
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    >
                      {copiedSection === 'curl-create' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-xs font-mono text-slate-200">
                    <code>{`curl -X POST ${baseUrl}/mailboxes \\\n  -H "Content-Type: application/json" \\\n  -d '{"service":"server-1"}'`}</code>
                  </pre>
                </div>

                {/* Step 2 cURL */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      2. cURL — Baca Pesan Masuk
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `curl "${baseUrl}/mailboxes/<ADDRESS_URL_ENCODED>/messages?service=server-1&token=<TOKEN>"`,
                          'curl-read'
                        )
                      }
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    >
                      {copiedSection === 'curl-read' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-xs font-mono text-slate-200">
                    <code>{`curl "${baseUrl}/mailboxes/<ADDRESS_URL_ENCODED>/messages?service=server-1&token=<TOKEN>"`}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Endpoints Reference */}
            <section id="endpoints" className="scroll-mt-24 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900">Endpoints Reference</h2>

              {/* POST /api/mailboxes */}
              <div id="mailboxes" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                    POST
                  </span>
                  <code className="font-mono text-sm font-semibold text-slate-900">/api/mailboxes</code>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  {lang === 'id'
                    ? 'Membuat mailbox email sementara baru pada layanan yang dipilih.'
                    : 'Create a new temporary mailbox on the chosen service.'}
                </p>

                {/* Request Table */}
                <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Request Body (JSON)</h4>
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Field</th>
                        <th className="px-3 py-2">Tipe</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">service</td>
                        <td className="px-3 py-2 font-mono text-slate-400">string?</td>
                        <td className="px-3 py-2 text-slate-600">server-1 | server-2 | server-3 | gmail. Default: server-1.</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">name</td>
                        <td className="px-3 py-2 font-mono text-slate-400">string?</td>
                        <td className="px-3 py-2 text-slate-600">Username kustom sebelum tanda @.</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">domain</td>
                        <td className="px-3 py-2 font-mono text-slate-400">string?</td>
                        <td className="px-3 py-2 text-slate-600">Domain pilihan dari /api/domains.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Response Sample */}
                <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contoh Respon (201 Created)</h4>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs font-mono text-slate-200">
                  <code>{JSON.stringify(
                    {
                      ok: true,
                      mailbox: {
                        id: "budi%40ozsaip.com",
                        serviceId: "server-1",
                        address: "budi@ozsaip.com",
                        token: "kp7mq2xr9vld",
                        createdAt: "2026-09-10T09:00:00.000Z",
                        expiresAt: null,
                        expiresAtIsEstimate: false,
                        service: "Server 1"
                      }
                    },
                    null,
                    2
                  )}</code>
                </pre>
              </div>

              {/* GET /api/mailboxes/:id/messages */}
              <div id="messages" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
                    GET
                  </span>
                  <code className="font-mono text-sm font-semibold text-slate-900">/api/mailboxes/:id/messages</code>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  {lang === 'id'
                    ? 'Mengambil daftar pesan masuk untuk alamat terkait.'
                    : 'Fetch list of incoming messages for the specified mailbox.'}
                </p>

                <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Query Parameters</h4>
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Parameter</th>
                        <th className="px-3 py-2">Tipe</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">service</td>
                        <td className="px-3 py-2 font-mono text-slate-400">string</td>
                        <td className="px-3 py-2 text-slate-600">ID layanan mailbox (mis. server-1).</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">token</td>
                        <td className="px-3 py-2 font-mono text-slate-400">string</td>
                        <td className="px-3 py-2 text-slate-600">Token akses keamanan mailbox (query atau header Authorization: Bearer).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GET /api/domains */}
              <div id="domains" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
                    GET
                  </span>
                  <code className="font-mono text-sm font-semibold text-slate-900">/api/domains?service=server-1</code>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  {lang === 'id'
                    ? 'Mengambil daftar nama domain yang aktif dan tersedia untuk server yang dipilih.'
                    : 'Fetch active domains available for the selected server.'}
                </p>
              </div>

              {/* GET /api/config */}
              <div id="config" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
                    GET
                  </span>
                  <code className="font-mono text-sm font-semibold text-slate-900">/api/config</code>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  {lang === 'id'
                    ? 'Metadata konfigurasi server, layanan aktif, dan aturan rate limit.'
                    : 'Server configuration metadata, active services, and rate limit rules.'}
                </p>
              </div>
            </section>

            {/* Code Examples Section */}
            <section id="contoh" className="scroll-mt-24 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900">
                {lang === 'id' ? 'Contoh Implementasi Lengkap' : 'Full Code Examples'}
              </h2>

              {/* JavaScript Fetch */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    JavaScript (Fetch)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `// 1) Buat mailbox\nconst created = await fetch("${baseUrl}/mailboxes", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ service: "server-1", name: "budi" }),\n}).then(r => r.json());\n\nconst { address, id, token } = created.mailbox;\nconsole.log("Email aktif:", address);\n\n// 2) Baca pesan masuk\nconst inbox = await fetch(\n  \`${baseUrl}/mailboxes/\${id}/messages?service=server-1&token=\${token}\`\n).then(r => r.json());\n\nconsole.log("Pesan diterima:", inbox.messages);`,
                        'js-code'
                      )
                    }
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    {copiedSection === 'js-code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-slate-200">
                  <code>{`// 1) Buat mailbox
const created = await fetch("${baseUrl}/mailboxes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ service: "server-1", name: "budi" }),
}).then(r => r.json());

const { address, id, token } = created.mailbox;
console.log("Email aktif:", address);

// 2) Baca pesan masuk
const inbox = await fetch(
  \`${baseUrl}/mailboxes/\${id}/messages?service=server-1&token=\${token}\`
).then(r => r.json());

console.log("Pesan diterima:", inbox.messages);`}</code>
                </pre>
              </div>

              {/* Python Requests */}
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Terminal className="h-3.5 w-3.5 text-amber-400" />
                    Python (Requests)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `import requests\n\nBASE = "${baseUrl}"\n\n# 1) Buat mailbox\nr = requests.post(f"{BASE}/mailboxes", json={"service": "server-1"})\nmailbox = r.json()["mailbox"]\naddress = mailbox["address"]\nmid = mailbox["id"]\ntoken = mailbox["token"]\n\n# 2) Baca pesan masuk\ninbox = requests.get(f"{BASE}/mailboxes/{mid}/messages?service=server-1&token={token}").json()\nprint(f"Pesan di {address}:", inbox["messages"])`,
                        'py-code'
                      )
                    }
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    {copiedSection === 'py-code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Salin</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-slate-200">
                  <code>{`import requests

BASE = "${baseUrl}"

# 1) Buat mailbox
r = requests.post(f"{BASE}/mailboxes", json={"service": "server-1"})
mailbox = r.json()["mailbox"]
address = mailbox["address"]
mid = mailbox["id"]
token = mailbox["token"]

# 2) Baca pesan masuk
inbox = requests.get(f"{BASE}/mailboxes/{mid}/messages?service=server-1&token={token}").json()
print(f"Pesan di {address}:", inbox["messages"])`}</code>
                </pre>
              </div>
            </section>
          </article>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
