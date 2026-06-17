import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SkipLink } from '@/src/components/ui/SkipLink';
import { AriaLiveRegion } from '@/src/components/ui/AriaLiveRegion';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
        <div id="main-content" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}
