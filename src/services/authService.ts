/**
 * Auth service — SEP-10 Stellar Web Authentication.
 */

import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api/client';

function withSignal(signal?: AbortSignal): AxiosRequestConfig { return signal ? { signal } : {}; }

export interface Sep10Challenge { transaction: string; networkPassphrase: string; }
export interface AuthToken { token: string; expiresAt: number; }
export interface Sep10SubmitRequest { transaction: string; publicKey: string; }
export interface AuthSession { publicKey: string; network: string; expiresAt: number; }

export const authService = {
  getSep10Challenge(publicKey: string, signal?: AbortSignal) {
    return apiClient.get<Sep10Challenge>('/auth/challenge', { params: { publicKey }, ...withSignal(signal) });
  },
  submitSep10Response(body: Sep10SubmitRequest, signal?: AbortSignal) {
    return apiClient.post<AuthToken>('/auth/token', body, withSignal(signal));
  },
  refreshToken(signal?: AbortSignal) {
    return apiClient.post<AuthToken>('/auth/refresh', undefined, withSignal(signal));
  },
  getSession(signal?: AbortSignal) {
    return apiClient.get<{ data: AuthSession }>('/auth/session', withSignal(signal));
  },
};
