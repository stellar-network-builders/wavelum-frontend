import { Card } from '@/components/ui';

const STATS = [
  { label: 'Total Vested', value: '—' },
  { label: 'Available to Claim', value: '—' },
  { label: 'Active Vaults', value: '—' },
  { label: 'Streaming Rate', value: '—' },
];

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your vesting positions and token streams.
        </p>
      </header>

      {/* Responsive stat grid: 1 col on mobile, 2 on tablet, 4 on desktop. */}
      <section
        aria-label="Portfolio summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Vesting activity
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Charts and recent activity will appear here.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Upcoming claims
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Your next claimable amounts will appear here.
          </p>
        </Card>
      </section>
    </div>
  );
}
