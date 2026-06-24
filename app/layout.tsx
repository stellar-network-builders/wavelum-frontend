import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AriaLiveRegion, SkipLink, WebVitals } from '@/components/ui';
import { QueryProvider } from '@/src/providers/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Lumina Network',
  description: 'Blockchain-based vesting vault and token streaming on Stellar Soroban',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <AriaLiveRegion />
        <WebVitals />
        <QueryProvider>
          <div id="main-content" role="main">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
