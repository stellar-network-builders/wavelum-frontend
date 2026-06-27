/**
 * Wallet feature types
 */

export type StellarNetwork = 'testnet' | 'mainnet';

export type WalletErrorType =
  | 'wallet_not_detected'
  | 'connection_rejected'
  | 'wrong_network'
  | 'signing_failed'
  | 'auth_failed'
  | 'unknown';

export interface WalletError {
  type: WalletErrorType;
  message: string;
}

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: StellarNetwork;
  isAvailable: boolean;
  error: WalletError | null;
}

export interface SEP10ChallengeResponse {
  transaction: string;
  networkPassphrase: string;
}

export interface SEP10TokenResponse {
  token: string;
}
