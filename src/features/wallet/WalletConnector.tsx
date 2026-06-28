'use client';

import { DownloadSimple, Wallet } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui';

import { useWallet } from './useWallet';
import { WalletDropdown } from './WalletDropdown';

const FREIGHTER_INSTALL_URL = 'https://www.freighter.app/';

/**
 * Entry point for wallet connection.
 *
 * - Freighter not installed → an install prompt linking to freighter.app
 * - Not connected           → a "Connect Wallet" button
 * - Connected               → the {@link WalletDropdown}
 */
export function WalletConnector() {
  const { isAvailable, isConnected, connect } = useWallet();
  const [connecting, setConnecting] = useState(false);

  if (!isAvailable) {
    return (
      <a
        href={FREIGHTER_INSTALL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <DownloadSimple className="h-4 w-4" aria-hidden="true" />
        Install Freighter
      </a>
    );
  }

  if (isConnected) {
    return <WalletDropdown />;
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      await connect();
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Button
      onClick={handleConnect}
      loading={connecting}
      leftIcon={<Wallet className="h-4 w-4" aria-hidden="true" />}
    >
      Connect Wallet
    </Button>
  );
}
