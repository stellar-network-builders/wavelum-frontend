import type { Metadata } from 'next';

import { DashboardLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Dashboard · Lumina',
};

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
