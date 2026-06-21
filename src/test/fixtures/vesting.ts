/**
 * Test fixtures for vesting schedules matching backend response shapes.
 */

export interface VestingSchedule {
  id: string;
  beneficiary: string;
  creator: string;
  tokenAddress: string;
  totalAmount: string;
  claimedAmount: string;
  startTime: number;
  endTime: number;
  cliffTime: number;
  releaseInterval: number;
  status: 'active' | 'paused' | 'completed' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

/** A vesting schedule that is currently active with partial claims. */
export const activeVesting: VestingSchedule = {
  id: 'vest_001',
  beneficiary: 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  creator: 'GB0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  totalAmount: '100000.0000000',
  claimedAmount: '25000.0000000',
  startTime: Math.floor(Date.now() / 1000) - 86400 * 30,
  endTime: Math.floor(Date.now() / 1000) + 86400 * 335,
  cliffTime: Math.floor(Date.now() / 1000) - 86400 * 15,
  releaseInterval: 86400,
  status: 'active',
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-15T12:00:00Z',
};

/** A vesting schedule that just started (cliff hasn't passed yet). */
export const preCliffVesting: VestingSchedule = {
  id: 'vest_002',
  beneficiary: 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  creator: 'GB0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  totalAmount: '50000.0000000',
  claimedAmount: '0.0000000',
  startTime: Math.floor(Date.now() / 1000),
  endTime: Math.floor(Date.now() / 1000) + 86400 * 180,
  cliffTime: Math.floor(Date.now() / 1000) + 86400 * 30,
  releaseInterval: 86400,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** A vesting schedule that has been fully claimed. */
export const completedVesting: VestingSchedule = {
  id: 'vest_003',
  beneficiary: 'GC1111222233334444555566667777888899990000',
  creator: 'GB0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  totalAmount: '10000.0000000',
  claimedAmount: '10000.0000000',
  startTime: Math.floor(Date.now() / 1000) - 86400 * 200,
  endTime: Math.floor(Date.now() / 1000) - 86400 * 10,
  cliffTime: Math.floor(Date.now() / 1000) - 86400 * 190,
  releaseInterval: 86400,
  status: 'completed',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
};

/** A vesting schedule that was revoked by the creator. */
export const revokedVesting: VestingSchedule = {
  id: 'vest_004',
  beneficiary: 'GD4444555566667777888899990000111122223333',
  creator: 'GB0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  totalAmount: '20000.0000000',
  claimedAmount: '5000.0000000',
  startTime: Math.floor(Date.now() / 1000) - 86400 * 60,
  endTime: Math.floor(Date.now() / 1000) + 86400 * 120,
  cliffTime: Math.floor(Date.now() / 1000) - 86400 * 45,
  releaseInterval: 86400,
  status: 'revoked',
  createdAt: '2025-04-01T00:00:00Z',
  updatedAt: '2025-05-15T12:00:00Z',
};

/** An empty array for "no vesting schedules" states. */
export const emptyVestings: VestingSchedule[] = [];

/** A full list of all vesting schedules. */
export const allVestings: VestingSchedule[] = [
  activeVesting,
  preCliffVesting,
  completedVesting,
  revokedVesting,
];

/** Dashboard summary derived from vesting schedules. */
export interface VestingSummary {
  totalVested: string;
  availableToClaim: string;
  nextVesting: string;
  schedulesCount: number;
  activeCount: number;
}

export const vestingSummary: VestingSummary = {
  totalVested: '180000.0000000',
  availableToClaim: '30000.0000000',
  nextVesting: new Date(Date.now() + 86400 * 1000).toISOString(),
  schedulesCount: 4,
  activeCount: 2,
};
