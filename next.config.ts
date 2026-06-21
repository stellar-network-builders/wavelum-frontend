import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,
const cspDirectives = [
  `default-src 'self'`,
  `script-src 'self'`,
  `connect-src 'self' https://*.stellar.org https://soroban-testnet.stellar.org`,
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

  // Source maps for Sentry
  productionBrowserSourceMaps: true,
};

// Sentry configuration for source maps upload
const sentryWebpackPluginOptions = {
  silent: true, // Suppresses logs during build
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

let exportedConfig = withNextIntl(nextConfig);

// Only apply Sentry in production builds
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN) {
  exportedConfig = withSentryConfig(exportedConfig, sentryWebpackPluginOptions);
}

export default exportedConfig;
