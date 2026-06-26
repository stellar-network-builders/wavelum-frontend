'use client';

import { Wallet } from '@phosphor-icons/react';

import { Badge } from '@/components/ui';

import { useAuthStore } from '@/src/stores/authStore';

function truncateKey(key: string): string {
  return key.length > 10 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;
}

/**
 * Compact wallet connection indicator for the header: shows the connection
 * state and, when authenticated, the truncated Stellar public key.
 */
export function WalletStatus() {
  const status = useAuthStore((state) => state.status);
  const publicKey = useAuthStore((state) => state.publicKey);

  const isConnected = status === 'connected' || status === 'authenticated';

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <Badge variant={isConnected ? 'active' : 'default'}>
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        {status === 'authenticated' && publicKey
          ? truncateKey(publicKey)
          : status === 'connected'
            ? 'Connected'
            : status === 'connecting'
              ? 'Connecting…'
              : 'Disconnected'}
      </Badge>
    </div>
  );
}
