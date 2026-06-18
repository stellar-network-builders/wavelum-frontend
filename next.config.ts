import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
};

const configWithIntl = withNextIntl(nextConfig);

const configWithBundleAnalyzer = withBundleAnalyzer({
enabled: process.env.ANALYZE === 'true',
})(configWithIntl);

export default configWithBundleAnalyzer;