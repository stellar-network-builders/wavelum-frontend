/**
 * Test fixtures representing common wallet connection states.
 */

export interface MockWalletState {
  connected: boolean;
  publicKey: string | null;
  network: string;
  networkPassphrase: string;
  error: string | null;
}

/** Wallet is installed and connected to the correct network. */
export const walletConnected: MockWalletState = {
  connected: true,
  publicKey: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGH',
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  error: null,
};

/** Wallet is installed but not connected (user hasn't approved). */
export const walletDisconnected: MockWalletState = {
  connected: false,
  publicKey: null,
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  error: null,
};

/** Wallet is connected but on the wrong network (e.g. mainnet while dApp expects testnet). */
export const walletWrongNetwork: MockWalletState = {
  connected: true,
  publicKey: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGH',
  network: 'PUBLIC',
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  error: null,
};

/** Wallet is not installed at all. */
export const walletNotInstalled: MockWalletState = {
  connected: false,
  publicKey: null,
  network: '',
  networkPassphrase: '',
  error: 'Freighter not detected',
};

/** Multiple test accounts for multi-account flows. */
export const testAccounts = [
  {
    publicKey: 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    balance: '1000.0000000',
  },
  {
    publicKey: 'GB0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987',
    balance: '500.0000000',
  },
  {
    publicKey: 'GC1111222233334444555566667777888899990000',
    balance: '0.0000000',
  },
];
