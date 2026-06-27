'use client';

import { Wallet } from '@phosphor-icons/react';

import { Button } from '@/components/ui/Button';
import { useWalletContext } from '@/src/providers/WalletProvider';

/**
 * WalletConnector component
 * 
 * Displays a "Connect Wallet" button when disconnected, and handles the connection flow.
 * Shows network selector for testnet/mainnet switching.
 */
export function WalletConnector() {
  const { isConnected, isConnecting, isAvailable, connect, network, switchNetwork, error } = useWalletContext();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      // Error is already set in the hook state
      console.error('Connection failed:', err);
    }
  };

  const handleNetworkSwitch = async (newNetwork: 'testnet' | 'mainnet') => {
    try {
      await switchNetwork(newNetwork);
    } catch (err) {
      console.error('Network switch failed:', err);
    }
  };

  if (!isAvailable) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Install Freighter
          </a>
        </Button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
          <div className="flex gap-1">
            <button
              onClick={() => handleNetworkSwitch('testnet')}
              className={`px-2 py-1 text-xs rounded ${
                network === 'testnet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => handleNetworkSwitch('mainnet')}
              className={`px-2 py-1 text-xs rounded ${
                network === 'mainnet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Mainnet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="primary"
        size="sm"
        onClick={handleConnect}
        loading={isConnecting}
        leftIcon={<Wallet className="h-4 w-4" />}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error.message}
        </div>
      )}
    </div>
  );
}
