'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useToast } from '@/components/ui';

import { useAuthStore } from '@/src/stores/authStore';
import type { WalletStatus } from '@/src/types/domain';

import { runSep10Flow, isJwtExpired } from './sep10';
import { WalletConnectionError, type WalletNetwork } from './types';
import {
  detectWallet,
  getActiveAddress,
  getActiveNetwork,
  isWalletAllowed,
  requestPublicKey,
  signTransactionXdr,
  watchWallet,
} from './walletClient';

/* ─── Context ────────────────────────────────────────────────────────────── */

export type WalletContextValue = {
  status: WalletStatus;
  /** Whether the Freighter extension is installed. */
  isAvailable: boolean;
  isConnected: boolean;
  publicKey: string | null;
  /** The wallet's active network (read from Freighter). */
  network: WalletNetwork | null;
  /** The network the app expects to operate on. */
  targetNetwork: WalletNetwork;
  /** True when the wallet's network differs from {@link targetNetwork}. */
  isWrongNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: WalletNetwork) => void;
  signTransaction: (xdr: string) => Promise<string>;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const VALID_NETWORKS: WalletNetwork[] = ['testnet', 'mainnet', 'futurenet'];

function envTargetNetwork(): WalletNetwork {
  const env = process.env.NEXT_PUBLIC_NETWORK as WalletNetwork | undefined;
  return env && VALID_NETWORKS.includes(env) ? env : 'testnet';
}

/* ─── Provider ───────────────────────────────────────────────────────────── */

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const status = useAuthStore((s) => s.status);
  const publicKey = useAuthStore((s) => s.publicKey);

  const [isAvailable, setIsAvailable] = useState(false);
  const [network, setNetwork] = useState<WalletNetwork | null>(null);
  const [targetNetwork, setTargetNetwork] = useState<WalletNetwork>(envTargetNetwork);

  // Avoid re-running the one-time session restore.
  const restoredRef = useRef(false);

  /** SEP-10 challenge signer bound to the active account/network. */
  const sign = useCallback(
    (xdr: string, networkPassphrase: string) =>
      signTransactionXdr(xdr, { networkPassphrase }),
    [],
  );

  /* Connect: request access → SEP-10 → authenticated. */
  const connect = useCallback(async () => {
    const auth = useAuthStore.getState();

    if (!(await detectWallet())) {
      setIsAvailable(false);
      toast({
        title: 'Wallet not detected',
        description: 'Install the Freighter extension to connect.',
        variant: 'error',
      });
      return;
    }

    auth.setConnecting();
    try {
      const address = await requestPublicKey();
      const active = await getActiveNetwork();
      setNetwork(active?.network ?? null);
      auth.setConnected(address);

      if (active && active.network !== targetNetwork) {
        toast({
          title: 'Wrong network',
          description: `Switch your wallet to ${targetNetwork}.`,
          variant: 'warning',
        });
      }

      // SEP-10 authentication. A failure leaves the wallet connected (but not
      // authenticated) so the user can retry without re-approving access.
      try {
        const result = await runSep10Flow({ account: address, sign });
        auth.setAuthenticated(result.token, {
          id: result.user?.id ?? address,
          publicKey: address,
          role: result.user?.role,
        });
        toast({ title: 'Wallet connected', variant: 'success' });
      } catch {
        toast({
          title: 'Authentication failed',
          description: 'Connected, but sign-in could not complete. Please retry.',
          variant: 'error',
        });
      }
    } catch (error) {
      auth.disconnect();
      const message =
        error instanceof WalletConnectionError
          ? error.message
          : 'Could not connect to your wallet.';
      toast({ title: 'Connection failed', description: message, variant: 'error' });
    }
  }, [sign, targetNetwork, toast]);

  const disconnect = useCallback(() => {
    useAuthStore.getState().disconnect();
    setNetwork(null);
    toast({ title: 'Wallet disconnected', variant: 'info' });
  }, [toast]);

  const switchNetwork = useCallback(
    (next: WalletNetwork) => {
      setTargetNetwork(next);
      if (network && network !== next) {
        toast({
          title: 'Switch network in your wallet',
          description: `Set Freighter to ${next} to match the app.`,
          variant: 'warning',
        });
      }
    },
    [network, toast],
  );

  const signTransaction = useCallback(
    (xdr: string) => {
      const passphrase = undefined; // Freighter signs against its active network.
      return signTransactionXdr(xdr, { networkPassphrase: passphrase });
    },
    [],
  );

  /* One-time detection + session restore on mount. */
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    let cancelled = false;

    (async () => {
      const available = await detectWallet();
      if (cancelled) return;
      setIsAvailable(available);
      if (!available || !(await isWalletAllowed())) return;

      const address = await getActiveAddress();
      if (cancelled || !address) return;

      const active = await getActiveNetwork();
      if (!cancelled) setNetwork(active?.network ?? null);

      const auth = useAuthStore.getState();
      const sameAccount = auth.publicKey === address;
      const tokenExpired = auth.token ? isJwtExpired(auth.token) : true;

      if (sameAccount && auth.token && !tokenExpired) {
        return; // Valid persisted session — keep it.
      }
      if (sameAccount && auth.token && tokenExpired) {
        toast({
          title: 'Session expired',
          description: 'Please reconnect your wallet.',
          variant: 'warning',
        });
      }
      auth.setConnected(address); // Links the wallet; awaits fresh SEP-10.
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  /* Watch for account/network changes made inside Freighter. */
  useEffect(() => {
    if (!isAvailable) return;

    const stop = watchWallet((change) => {
      const auth = useAuthStore.getState();

      if (change.address && change.address !== auth.publicKey) {
        auth.setConnected(change.address); // New account → re-auth required.
        setNetwork(change.network);
        toast({
          title: 'Account changed',
          description: 'Reconnect to authenticate the new account.',
          variant: 'info',
        });
        return;
      }

      setNetwork((current) => {
        if (current !== change.network && change.network !== targetNetwork) {
          toast({
            title: 'Wrong network',
            description: `Switch your wallet to ${targetNetwork}.`,
            variant: 'warning',
          });
        }
        return change.network;
      });
    });

    return stop;
  }, [isAvailable, targetNetwork, toast]);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      isAvailable,
      isConnected: status === 'connected' || status === 'authenticated',
      publicKey,
      network,
      targetNetwork,
      isWrongNetwork: network !== null && network !== targetNetwork,
      connect,
      disconnect,
      switchNetwork,
      signTransaction,
    }),
    [
      status,
      isAvailable,
      publicKey,
      network,
      targetNetwork,
      connect,
      disconnect,
      switchNetwork,
      signTransaction,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
