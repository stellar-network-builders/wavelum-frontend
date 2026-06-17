import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SkipLink } from '@/src/components/ui/SkipLink';
import { AriaLiveRegion } from '@/src/components/ui/AriaLiveRegion';
import { WebVitals } from '@/src/components/ui/WebVitals';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
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
        <div id="main-content" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}
