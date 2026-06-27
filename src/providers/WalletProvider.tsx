/**
 * WalletProvider
 * 
 * React context provider that wraps the entire app to provide wallet state
 * and functionality to all components.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useWallet } from '@/features/wallet';

interface WalletContextValue {
  isConnected: boolean;
  publicKey: string | null;
  network: 'testnet' | 'mainnet';
  isAvailable: boolean;
  isConnecting: boolean;
  error: { type: string; message: string } | null;
  connect: () => Promise<string>;
  disconnect: () => void;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
  switchNetwork: (network: 'testnet' | 'mainnet') => Promise<void>;
  performSEP10Auth: (backendUrl: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const wallet = useWallet();

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
