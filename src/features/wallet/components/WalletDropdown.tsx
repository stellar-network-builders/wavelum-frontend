'use client';

import { CaretDown, SignOut, Copy } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { useWalletContext } from '@/src/providers/WalletProvider';

function truncateKey(key: string): string {
  return key.length > 10 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;
}

/**
 * WalletDropdown component
 * 
 * Displays connected account information, network status, and disconnect option.
 * Shows when wallet is connected.
 */
export function WalletDropdown() {
  const { isConnected, publicKey, network, disconnect } = useWalletContext();

  if (!isConnected || !publicKey) {
    return null;
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(publicKey);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="relative group">
      <Button variant="secondary" size="sm" className="flex items-center gap-2">
        <span className="text-sm font-medium">{truncateKey(publicKey)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">({network})</span>
        <CaretDown className="h-4 w-4" />
      </Button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connected Account</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {truncateKey(publicKey)}
              </code>
              <button
                onClick={handleCopyAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Copy address"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network</p>
            <span className="text-sm font-medium capitalize">{network}</span>
          </div>

          <hr className="my-3 border-gray-200 dark:border-gray-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <SignOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
