/** Stellar networks the app understands. */
export type WalletNetwork = 'testnet' | 'mainnet' | 'futurenet';

/**
 * Connection lifecycle, mirroring the auth store's {@link WalletStatus}:
 * - `disconnected` — no wallet linked
 * - `connecting`   — awaiting wallet approval / SEP-10 exchange
 * - `connected`    — wallet linked, not yet authenticated with the backend
 * - `authenticated`— SEP-10 complete, JWT held
 */
export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated';

/** Normalized error raised by the wallet layer. */
export class WalletConnectionError extends Error {
  constructor(
    message: string,
    public code:
      | 'NO_WALLET'
      | 'REJECTED'
      | 'WRONG_NETWORK'
      | 'AUTH_FAILED'
      | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}
