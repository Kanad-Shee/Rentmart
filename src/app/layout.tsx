import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import type { Metadata } from 'next';
import { Iceberg, Geist, Inter, Manrope } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope'
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-mono'
});

const brand = Iceberg({
  subsets: ['latin'],
  variable: '--font-brand',
  weight: ['400']
});

export const metadata: Metadata = {
  title: {
    default: 'Rentmart',
    template: '%s | Rentmart'
  },
  description:
    'Rentmart is an equipment rental marketplace that helps owners list machinery and renters book trusted industrial equipment with confidence.',
  applicationName: 'Rentmart',
  keywords: [
    'Rentmart',
    'equipment rental',
    'machinery rental',
    'industrial marketplace',
    'construction equipment',
    'farm equipment rental'
  ],
  appleWebApp: {
    title: 'Rentmart'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans">
      <body
        className={`${inter.className} ${manrope.variable} ${geist.variable} ${brand.variable} min-h-full flex flex-col selection:bg-neutral-900 selection:text-white`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position="bottom-left"
          toastOptions={{ className: 'font-sans' }}
        />
      </body>
    </html>
  );
}
