import { Card } from '@/components/ui';

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Vesting Vaults
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create and manage your vesting vaults.
        </p>
      </header>
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Vault list coming soon.
        </p>
      </Card>
    </div>
  );
}
