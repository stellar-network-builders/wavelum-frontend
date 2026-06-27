import { Card } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Insights across your vaults and streams.
        </p>
      </header>
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Analytics coming soon.
        </p>
      </Card>
    </div>
  );
}
