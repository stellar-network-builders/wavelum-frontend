/**
 * Auth service — SEP-10 Stellar Web Auth handshake and session refresh.
 *
 * Flow: request a challenge transaction → sign it with the wallet →
 * submit the signed XDR to exchange it for a JWT session token.
 * @see https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
 */

import type { Sep10Challenge, Sep10TokenResponse } from '@/src/types/api';

import { http } from './api/client';

export const authService = {
  /** Request a SEP-10 challenge transaction for the given Stellar account. */
  getSep10Challenge: (account: string, signal?: AbortSignal) =>
    http.get<Sep10Challenge>('/auth/sep10/challenge', {
      params: { account },
      signal,
    }),

  /** Submit the wallet-signed challenge XDR to obtain a JWT session token. */
  submitSep10Response: (signedTransactionXdr: string, signal?: AbortSignal) =>
    http.post<Sep10TokenResponse>(
      '/auth/sep10/token',
      { transaction: signedTransactionXdr },
      { signal },
    ),

  /** Exchange the current (still-valid) token for a fresh one. */
  refreshToken: (signal?: AbortSignal) =>
    http.post<Sep10TokenResponse>('/auth/refresh', undefined, { signal }),
};
