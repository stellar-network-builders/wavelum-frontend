'use client';

import { useContext } from 'react';

import { WalletContext, type WalletContextValue } from './WalletProvider';

/**
 * Access wallet connection state and actions.
 *
 * @example
 * const { isConnected, publicKey, connect, disconnect, signTransaction } = useWallet();
 *
 * @throws if used outside a `<WalletProvider>`.
 */
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a <WalletProvider>.');
  }
  return ctx;
}
