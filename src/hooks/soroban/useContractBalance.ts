/**
 * useContractBalance hook.
 *
 * Real-time token balance queries via Soroban for a given wallet address.
 * Uses the TokenContract wrapper and useSorobanQuery for caching.
 *
 * @example
 * const { balance, symbol, decimals, isLoading } = useContractBalance(walletAddress);
 */

import { useMemo } from 'react';

import { TokenContract } from '@/services/soroban/contracts/TokenContract';
import type { TokenBalanceInfo } from '@/services/soroban/types';

import { useSorobanQuery } from './useSorobanQuery';

/**
 * Hook to fetch a wallet's token balance from the Lumina token contract.
 *
 * Only queries when `address` is a non-empty string.
 *
 * @param address - The wallet's Stellar public key.
 * @param refetchInterval - Optional polling interval in milliseconds.
 * @returns Token balance info with loading/error states.
 */
export function useContractBalance(
  address: string | undefined | null,
  refetchInterval?: number,
) {
  const contract = useMemo(() => new TokenContract(), []);

  return useSorobanQuery<TokenBalanceInfo>(
    ['soroban', 'tokenBalance', address ?? ''],
    () => contract.getTokenBalance(address!),
    {
      enabled: !!address && address.length > 0,
      refetchInterval,
      staleTime: 15_000, // Balances can change frequently
    },
  );
}
