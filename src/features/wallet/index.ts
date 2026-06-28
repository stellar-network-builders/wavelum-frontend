/**
 * Wallet Feature Module
 *
 * Stellar wallet connection (Freighter) and SEP-10 authentication.
 * Import from `@/features/wallet` to access the module's public API.
 */

export { WalletProvider, WalletContext } from './WalletProvider';
export type { WalletContextValue } from './WalletProvider';
export { useWallet } from './useWallet';
export { WalletConnector } from './WalletConnector';
export { WalletDropdown } from './WalletDropdown';
export { WalletConnectionError } from './types';
export type { WalletNetwork, WalletConnectionStatus } from './types';

// Framework-agnostic core (also useful for tests / non-React consumers).
export {
  detectWallet,
  isWalletAllowed,
  getActiveAddress,
  getActiveNetwork,
  requestPublicKey,
  signTransactionXdr,
  mapFreighterNetwork,
  watchWallet,
} from './walletClient';
export {
  runSep10Flow,
  requestSep10Challenge,
  submitSep10Challenge,
  decodeJwtExpiry,
  isJwtExpired,
} from './sep10';
