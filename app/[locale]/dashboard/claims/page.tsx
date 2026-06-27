import { Card } from '@/components/ui';

export default function ClaimsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Claims History
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review your past and pending claims.
        </p>
      </header>
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Claims history coming soon.
        </p>
      </Card>
    </div>
  );
}
