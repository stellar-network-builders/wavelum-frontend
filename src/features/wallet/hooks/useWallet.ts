/**
 * useWallet hook
 * 
 * Provides wallet connection, disconnection, and transaction signing functionality
 * using Freighter wallet integration.
 */

import { useCallback, useEffect, useState } from 'react';

import type { SEP10ChallengeResponse, SEP10TokenResponse, StellarNetwork, WalletError, WalletState } from '../types';

declare global {
  interface Window {
    freighter?: {
      isAllowed: () => Promise<boolean>;
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { networkPassphrase: string }) => Promise<string>;
      getNetwork: () => Promise<StellarNetwork>;
    };
  }
}

const INITIAL_WALLET_STATE: WalletState = {
  isConnected: false,
  publicKey: null,
  network: 'testnet',
  isAvailable: false,
  error: null,
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for wallet availability on mount
  useEffect(() => {
    const checkWalletAvailability = () => {
      const isAvailable = typeof window !== 'undefined' && !!window.freighter;
      setWalletState((prev) => ({ ...prev, isAvailable }));
    };

    checkWalletAvailability();

    // Listen for wallet installation/removal
    const handleStorageChange = () => {
      checkWalletAvailability();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for account changes when connected
  useEffect(() => {
    if (!walletState.isConnected || !walletState.isAvailable) return;

    const pollInterval = setInterval(async () => {
      try {
        const currentPublicKey = await window.freighter!.getPublicKey();
        if (currentPublicKey !== walletState.publicKey) {
          // Account changed in wallet
          setWalletState((prev) => ({
            ...prev,
            publicKey: currentPublicKey,
          }));
        }
      } catch (error) {
        // Ignore polling errors
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [walletState.isConnected, walletState.isAvailable, walletState.publicKey]);

  const connect = useCallback(async () => {
    if (!walletState.isAvailable) {
      const error: WalletError = {
        type: 'wallet_not_detected',
        message: 'Freighter wallet is not installed. Please install it from https://freighter.app',
      };
      setWalletState((prev) => ({ ...prev, error }));
      throw error;
    }

    setIsConnecting(true);
    setWalletState((prev) => ({ ...prev, error: null }));

    try {
      const isAllowed = await window.freighter!.isAllowed();
      if (!isAllowed) {
        // Request access
        await window.freighter!.getPublicKey();
      }

      const publicKey = await window.freighter!.getPublicKey();
      const network = await window.freighter!.getNetwork();

      setWalletState({
        isConnected: true,
        publicKey,
        network,
        isAvailable: true,
        error: null,
      });

      return publicKey;
    } catch (error) {
      const walletError: WalletError = {
        type: 'connection_rejected',
        message: error instanceof Error ? error.message : 'Failed to connect to wallet',
      };
      setWalletState((prev) => ({ ...prev, error: walletError }));
      throw walletError;
    } finally {
      setIsConnecting(false);
    }
  }, [walletState.isAvailable]);

  const disconnect = useCallback(() => {
    setWalletState(INITIAL_WALLET_STATE);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string): Promise<string> => {
      if (!walletState.isConnected || !walletState.publicKey) {
        const error: WalletError = {
          type: 'signing_failed',
          message: 'Wallet is not connected',
        };
        setWalletState((prev) => ({ ...prev, error }));
        throw error;
      }

      try {
        const signedXdr = await window.freighter!.signTransaction(xdr, {
          networkPassphrase: networkPassphrase || (walletState.network === 'mainnet' ? 'Public Global Stellar Network ; September 2015' : 'Test SDF Network ; September 2015'),
        });
        return signedXdr;
      } catch (error) {
        const walletError: WalletError = {
          type: 'signing_failed',
          message: error instanceof Error ? error.message : 'Failed to sign transaction',
        };
        setWalletState((prev) => ({ ...prev, error: walletError }));
        throw walletError;
      }
    },
    [walletState.isConnected, walletState.publicKey, walletState.network],
  );

  const switchNetwork = useCallback(
    async (network: StellarNetwork) => {
      if (!walletState.isConnected) {
        setWalletState((prev) => ({ ...prev, network }));
        return;
      }

      // Check if wallet is on the correct network
      const currentNetwork = await window.freighter!.getNetwork();
      if (currentNetwork !== network) {
        const error: WalletError = {
          type: 'wrong_network',
          message: `Please switch your wallet to ${network} in Freighter settings`,
        };
        setWalletState((prev) => ({ ...prev, error }));
        throw error;
      }

      setWalletState((prev) => ({ ...prev, network, error: null }));
    },
    [walletState.isConnected],
  );

  const performSEP10Auth = useCallback(
    async (backendUrl: string): Promise<string> => {
      if (!walletState.publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        // Step 1: Get challenge from backend
        const challengeResponse = await fetch(`${backendUrl}/api/auth/sep10`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey: walletState.publicKey }),
        });

        if (!challengeResponse.ok) {
          throw new Error('Failed to get SEP-10 challenge');
        }

        const { transaction, networkPassphrase }: SEP10ChallengeResponse = await challengeResponse.json();

        // Step 2: Sign the challenge transaction
        const signedTransaction = await window.freighter!.signTransaction(transaction, { networkPassphrase });

        // Step 3: Send signed transaction to backend to get JWT
        const tokenResponse = await fetch(`${backendUrl}/api/auth/sep10`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction: signedTransaction,
            publicKey: walletState.publicKey,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange signed transaction for token');
        }

        const { token }: SEP10TokenResponse = await tokenResponse.json();
        return token;
      } catch (error) {
        const walletError: WalletError = {
          type: 'auth_failed',
          message: error instanceof Error ? error.message : 'SEP-10 authentication failed',
        };
        setWalletState((prev) => ({ ...prev, error: walletError }));
        throw walletError;
      }
    },
    [walletState.publicKey],
  );

  return {
    ...walletState,
    isConnecting,
    connect,
    disconnect,
    signTransaction,
    switchNetwork,
    performSEP10Auth,
  };
};
