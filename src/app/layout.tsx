import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SetoMail — Email Sementara Instan',
  description:
    'Buat email sementara gratis tanpa daftar. Lindungi inbox utama dari spam — dengan API publik ber-dokumentasi.',
  keywords: ['temp mail', 'email sementara', 'disposable email', 'setomail', 'temporary email'],
  openGraph: {
    title: 'SetoMail — Email Sementara Instan',
    description: 'Email sementara gratis tanpa daftar, dengan API publik ber-dokumentasi.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
