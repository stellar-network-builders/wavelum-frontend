/**
 * Vesting test fixtures — mock vault and sub-schedule data.
 */

export const mockVault = {
  id: 'vault_01JQK4XNR8VZP3B5E7Y2AH90TM',
  name: 'Team Token Grant',
  description: '4-year vesting schedule for core contributors',
  network: 'testnet',
  contractAddress: 'CDLZFC3SYJYDZT7K67VZQK5HPHOJBXFHOE7EY3HGVXAZLDPTBH3P5JZM',
  tokenSymbol: 'LUM',
  tokenDecimals: 7,
  totalAllocated: '10000000000000',
  totalClaimed: '2500000000000',
  totalRemaining: '7500000000000',
  status: 'active' as const,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2026-06-24T12:00:00Z',
};

export const mockVaults = [
  mockVault,
  {
    id: 'vault_02', name: 'Advisor Allocation', network: 'testnet',
    contractAddress: 'CC2XZ3GCMKPM7PLBNWHTRHTYFLNBHF77FL6ML7S66JTB7X2W7ZS2HN64',
    tokenSymbol: 'LUM', tokenDecimals: 7,
    totalAllocated: '5000000000000', totalClaimed: '1250000000000', totalRemaining: '3750000000000',
    status: 'active' as const, createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-06-24T12:00:00Z',
  },
  {
    id: 'vault_03', name: 'Completed Grant', network: 'testnet',
    contractAddress: 'CD5YMQBK7BGQK2PLVCZKPR7W3XABFB2EI3KJEQERH2DB7IPQS7RGMOV6',
    tokenSymbol: 'USDC', tokenDecimals: 7,
    totalAllocated: '100000000000', totalClaimed: '100000000000', totalRemaining: '0',
    status: 'completed' as const, createdAt: '2024-06-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z',
  },
];

export const mockSubSchedules = [{
  id: 'sub_01',
  vaultId: mockVault.id,
  name: 'Linear monthly unlock',
  scheduleType: 'linear' as const,
  cliffSeconds: 0,
  startTimestamp: 1736899200,
  endTimestamp: 1863158400,
  totalAllocated: '6000000000000',
  totalClaimed: '1500000000000',
  totalRemaining: '4500000000000',
  claimableAmount: '125000000000',
  nextClaimTimestamp: 1751328000,
  status: 'active' as const,
  vestingEvents: [
    { amount: '250000000000', timestamp: 1736899200, claimed: true, txHash: 'a1b2...' },
    { amount: '250000000000', timestamp: 1744588800, claimed: true, txHash: 'f6e5...' },
    { amount: '125000000000', timestamp: 1751328000, claimed: false },
  ],
}];

export const mockClaimResponse = {
  success: true,
  txHash: '0f1e2d3c4b5a6978...',
  amount: '125000000000',
  newClaimableAmount: '0',
  vaultId: mockVault.id,
  subScheduleId: 'sub_01',
};
