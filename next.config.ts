import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

const configWithIntl = withNextIntl(nextConfig);

const configWithBundleAnalyzer = withBundleAnalyzer({
enabled: process.env.ANALYZE === 'true',
})(configWithIntl);

export default configWithBundleAnalyzer;