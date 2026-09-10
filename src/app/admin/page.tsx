'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Language } from '@/lib/i18n';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  Copy,
  Check,
  PlusCircle,
  Trash2,
  ExternalLink,
  RotateCw,
  Search,
  LogOut,
  Send,
  Loader2,
  Inbox,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminMailboxEntry } from '@/lib/admin-store';
import { MessageSummary, ServiceId } from '@/lib/types';
import { MessageDrawer } from '@/components/MessageDrawer';

const STORAGE_LANG_KEY = 'setomail_lang';
const ADMIN_STORAGE_KEY = 'setomail_admin_pin';

export default function AdminPage() {
  const [lang, setLang] = useState<Language>('id');
  const [adminPin, setAdminPin] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  // Mailboxes data
  const [mailboxes, setMailboxes] = useState<AdminMailboxEntry[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active inspected mailbox in admin
  const [activeMailbox, setActiveMailbox] = useState<AdminMailboxEntry | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageSummary | null>(null);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<string>('');
  const [newToken, setNewToken] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newService, setNewService] = useState<'server-1' | 'server-2' | 'server-3' | 'gmail'>('server-1');
  const [addingError, setAddingError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY) as Language;
      if (savedLang === 'id' || savedLang === 'en') {
        setLang(savedLang);
      }
      const savedPin = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (savedPin) {
        setAdminPin(savedPin);
        setIsAuthenticated(true);
      }
    } catch {}
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch {}
  };

  // Fetch admin mailboxes
  const fetchMailboxes = useCallback(async (pinToUse = adminPin) => {
    if (!pinToUse) return;
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/mailboxes', {
        headers: { 'x-admin-key': pinToUse },
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.mailboxes)) {
        setMailboxes(data.mailboxes);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    } catch {
      // Error
    } finally {
      setLoadingList(false);
    }
  }, [adminPin]);

  useEffect(() => {
    if (isAuthenticated && adminPin) {
      fetchMailboxes(adminPin);
    }
  }, [isAuthenticated, adminPin, fetchMailboxes]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPin.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setAdminPin(inputPin.trim());
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_STORAGE_KEY, inputPin.trim());
        fetchMailboxes(inputPin.trim());
      } else {
        setAuthError(data.error?.message || 'PIN Admin tidak cocok. Default: setomail2026');
      }
    } catch {
      setAuthError('Gagal terhubung ke server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPin('');
    setActiveMailbox(null);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  // Fetch messages for selected mailbox
  const fetchMessagesFor = useCallback(async (entry: AdminMailboxEntry) => {
    setActiveMailbox(entry);
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/mailboxes/${entry.id}/messages?service=${entry.serviceId}&token=${encodeURIComponent(
          entry.token
        )}`
      );
      const data = await res.json();
      if (data.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Delete mailbox from admin
  const handleDeleteMailbox = async (id: string, address: string) => {
    if (!window.confirm(`Hapus ${address} dari daftar pantauan admin?`)) return;

    try {
      const res = await fetch(`/api/admin/mailboxes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminPin },
      });
      const data = await res.json();
      if (data.ok) {
        setMailboxes((prev) => prev.filter((m) => m.id !== id));
        if (activeMailbox?.id === id) {
          setActiveMailbox(null);
          setMessages([]);
        }
      }
    } catch {
      alert('Gagal menghapus.');
    }
  };

  // Add custom mailbox to admin
  const handleAddMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim() || !newToken.trim()) {
      setAddingError('Alamat email dan token wajib diisi.');
      return;
    }
    setIsAdding(true);
    setAddingError(null);

    try {
      const res = await fetch('/api/admin/mailboxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminPin,
        },
        body: JSON.stringify({
          address: newAddress.trim().toLowerCase(),
          token: newToken.trim(),
          serviceId: newService,
          label: newLabel.trim() || 'Email Pantauan',
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setShowAddModal(false);
        setNewAddress('');
        setNewToken('');
        setNewLabel('');
        fetchMailboxes();
      } else {
        setAddingError(data.error?.message || 'Gagal menambahkan email.');
      }
    } catch {
      setAddingError('Gagal menghubungi server.');
    } finally {
      setIsAdding(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestToActive = async () => {
    if (!activeMailbox) return;
    try {
      await fetch(`/api/mailboxes/${activeMailbox.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verification' }),
      });
      await fetchMessagesFor(activeMailbox);
    } catch {}
  };

  const filteredMailboxes = mailboxes.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.address.toLowerCase().includes(q) ||
      (m.label && m.label.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />

      <main className="mx-auto flex-1 max-w-6xl px-4 py-8 sm:px-6 w-full">
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="mx-auto max-w-md pt-12">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-600/5 sm:p-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Shield className="h-6 w-6" />
              </div>

              <h2 className="text-center text-xl font-bold text-slate-900">
                Dashboard Admin SetoMail
              </h2>
              <p className="mt-1 text-center text-xs text-slate-500 leading-relaxed">
                Masukkan PIN keamanan admin untuk mengakses &amp; memantau kotak masuk email yang dipilih secara permanen.
              </p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    PIN / Password Admin
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <Lock className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="Masukkan PIN (default: setomail2026)"
                      className="w-full bg-transparent text-sm font-mono outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600 text-center">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi…</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Masuk ke Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    <Shield className="h-3.5 w-3.5" />
                    Admin Vault
                  </span>
                  <span className="text-xs text-slate-400">PIN Aktif</span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  Pemantauan Email Permanen
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Email Pantauan</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>

            {/* Layout: Monitored List (Left) + Live Inbox Viewer (Right) */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Email List */}
              <div className="lg:col-span-5 space-y-4">
                {/* Search Bar */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs">
                  <Search className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan alamat atau label..."
                    className="w-full bg-transparent outline-none placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => fetchMailboxes()}
                    title="Segarkan daftar"
                    className="ml-1 text-slate-400 hover:text-indigo-600"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Mailboxes Counter */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Daftar Email yang Dipantau ({filteredMailboxes.length})</span>
                </div>

                {/* Mailboxes Cards */}
                {loadingList && mailboxes.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
                    Memuat daftar email…
                  </div>
                ) : filteredMailboxes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                    Belum ada email yang dipantau. Tambahkan melalui tombol di atas atau simpan langsung dari halaman utama.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredMailboxes.map((mb) => {
                      const isSelected = activeMailbox?.id === mb.id;
                      return (
                        <div
                          key={mb.id}
                          className={`rounded-xl border p-3.5 transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              {mb.label || 'Pantauan'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {mb.serviceId}
                            </span>
                          </div>

                          <p className="mt-1 break-all font-mono text-xs font-bold text-slate-900">
                            {mb.address}
                          </p>

                          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                            <span className="font-mono text-[10px] text-slate-400">
                              Token: {mb.token.slice(0, 4)}••••{mb.token.slice(-3)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Copy Address */}
                              <button
                                type="button"
                                onClick={() => copyText(mb.address, `addr-${mb.id}`)}
                                title="Salin alamat"
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                {copiedId === `addr-${mb.id}` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Open Inbox */}
                              <button
                                type="button"
                                onClick={() => fetchMessagesFor(mb)}
                                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                <Inbox className="h-3 w-3" />
                                <span>Buka</span>
                              </button>

                              {/* Delete from monitoring */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMailbox(mb.id, mb.address)}
                                title="Hapus dari pantauan"
                                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Live Inbox Viewer */}
              <div className="lg:col-span-7">
                {!activeMailbox ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
                    <Mail className="mb-2 h-10 w-10 text-slate-300" />
                    <h3 className="text-sm font-bold text-slate-700">Pilih Email untuk Melihat Kotak Masuk</h3>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Klik tombol &quot;Buka&quot; pada salah satu email yang dipantau di sebelah kiri untuk melihat pesan masuk secara langsung.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Active Mailbox Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                            {activeMailbox.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {activeMailbox.serviceId}
                          </span>
                        </div>
                        <h3 className="mt-1 font-mono text-sm font-bold text-slate-900 break-all">
                          {activeMailbox.address}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSendTestToActive}
                          className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          title="Kirim email simulasi untuk menguji kotak masuk ini"
                        >
                          <Send className="h-3.5 w-3.5 text-amber-600" />
                          <span>Kirim Tes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fetchMessagesFor(activeMailbox)}
                          disabled={loadingMessages}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCw className={`h-3.5 w-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                          <span>Segarkan</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages List */}
                    <div className="p-4">
                      {loadingMessages ? (
                        <div className="flex min-h-[250px] items-center justify-center text-xs text-slate-400">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
                          Memeriksa email masuk…
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                          <Inbox className="mb-2 h-8 w-8 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">Belum ada email masuk untuk alamat ini.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Kirim email dari TunnelBear atau layanan lain ke alamat di atas, lalu klik Segarkan.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {messages.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => setSelectedMessage(m)}
                              className="group cursor-pointer py-3 transition hover:bg-indigo-50/50 rounded-xl px-2.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                                  {m.from.replace(/<.*?>/, '').trim() || m.fromEmail}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  {new Date(m.receivedAt * 1000).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <h5 className="mt-0.5 text-xs font-semibold text-indigo-600 truncate">
                                {m.subject}
                              </h5>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {m.bodyPreview}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Custom Mailbox Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Tambah Email ke Pantauan Admin</h3>
            <p className="mt-1 text-xs text-slate-500">
              Masukkan alamat email sementara dan token aksesnya agar admin dapat mengaksesnya kapan saja.
            </p>

            <form onSubmit={handleAddMailbox} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Label / Nama Akun
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Mis: Akun TunnelBear 1, Netflix Trial"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Alamat Email Lengkap
                </label>
                <input
                  type="email"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Token Akses
                </label>
                <input
                  type="text"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="Token akses 12 karakter"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Server Layanan
                </label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value as ServiceId)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="server-1">Server 1 (Utama)</option>
                  <option value="server-2">Server 2 (Skalabel)</option>
                  <option value="server-3">Server 3 (Cadangan)</option>
                  <option value="gmail">Gmail</option>
                </select>
              </div>

              {addingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-600">
                  {addingError}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isAdding ? 'Menyimpan…' : 'Simpan Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Drawer for reading full HTML & OTP */}
      {activeMailbox && selectedMessage && (
        <MessageDrawer
          mailbox={{
            id: activeMailbox.id,
            address: activeMailbox.address,
            token: activeMailbox.token,
            serviceId: activeMailbox.serviceId,
            createdAt: activeMailbox.savedAt,
            expiresAt: null,
            expiresAtIsEstimate: false,
            service: activeMailbox.serviceId,
          }}
          messageSummary={selectedMessage}
          lang={lang}
          onClose={() => setSelectedMessage(null)}
          onDeleteMessage={(id) => {
            setMessages((prev) => prev.filter((m) => m.id !== id));
          }}
        />
      )}

      <Footer lang={lang} />
    </div>
  );
}
