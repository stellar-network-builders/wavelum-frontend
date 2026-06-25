import createBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin();

const cspDirectives = [
  `default-src 'self'`,
  `script-src 'self'`,
  `connect-src 'self' https://*.stellar.org https://soroban-testnet.stellar.org https://*.sentry.io`,
  `frame-ancestors 'none'`,
  `img-src 'self' data: https://*.gravatar.com`,
  `style-src 'self' 'unsafe-inline'`,
  `base-uri 'self'`,
  `form-action 'self'`,
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.stellar.org',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'next-intl'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
          },
    ];
  },
};

export default withBundleAnalyzer(
  withNextIntl(
    withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      sourcemaps: {
        disable: false,
      },
      webpack: {
        treeshake: {
          removeDebugLogging: true,
        },
        automaticVercelMonitors: false,
      },
    }),
  ),
);