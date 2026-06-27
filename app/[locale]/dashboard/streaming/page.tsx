import { Card } from '@/components/ui';

export default function StreamingPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Token Streaming
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor real-time token streams.
        </p>
      </header>
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Streaming dashboard coming soon.
        </p>
      </Card>
    </div>
  );
}
