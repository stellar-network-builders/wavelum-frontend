import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AriaLiveRegion, SkipLink, WebVitals } from '@/components/ui';

import { QueryProvider } from '@/src/providers/QueryProvider';
import { ThemeProvider } from '@/src/providers/ThemeProvider';
import { WalletProvider } from '@/features/wallet';
import './globals.css';

/**
 * Applies the persisted theme before first paint to avoid a flash of the
 * wrong color scheme. Mirrors the resolution logic in `ThemeProvider`.
 */
const themeInitScript = `(function(){try{var t='system';var raw=localStorage.getItem('lumina-ui');if(raw){var s=JSON.parse(raw).state;if(s&&s.theme)t=s.theme;}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.classList.toggle('light',!d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <AriaLiveRegion />
        <WebVitals />
        <ThemeProvider>
          <WalletProvider>
            <QueryProvider>
              <div id="main-content" role="main">
                {children}
              </div>
            </QueryProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
