/**
 * Wallet test fixtures — mock wallet states for testing.
 */

export const connectedWallet = {
  freighter: {
    isConnected: true,
    publicKey: 'GBJ5SZLKO3VYXKJ5F5KOGZDCRWWMMSEECAHGJHWOBGF7BPBTMJ4YJ7OC',
    network: 'TESTNET',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  state: {
    address: 'GBJ5SZLKO3VYXKJ5F5KOGZDCRWWMMSEECAHGJHWOBGF7BPBTMJ4YJ7OC',
    displayAddress: 'GBJ5...7OC',
    network: 'testnet' as const,
    isConnected: true,
  },
};

export const disconnectedWallet = {
  freighter: { isConnected: false, publicKey: '', network: '', networkPassphrase: '' },
  state: { address: '', displayAddress: '', network: null, isConnected: false },
};

export const wrongNetworkWallet = {
  freighter: {
    isConnected: true,
    publicKey: 'GDXQ7YLGM3V5WGHUN4K7CU4BIXZLMKKH5KZZIX6VRGL7QOHFN5DHCR2I',
    network: 'PUBLIC',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
  state: {
    address: 'GDXQ7YLGM3V5WGHUN4K7CU4BIXZLMKKH5KZZIX6VRGL7QOHFN5DHCR2I',
    displayAddress: 'GDXQ...R2I',
    network: 'pubnet' as const,
    isConnected: true,
    isWrongNetwork: true,
  },
};
