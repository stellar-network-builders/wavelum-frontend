export type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated';

export type ThemePreference = 'system' | 'light' | 'dark';

export type CurrencyDisplay = 'native' | 'usd';

export type DateFormatPreference = 'relative' | 'absolute';

export type NotificationPreferences = {
  claimAvailable: boolean;
  vaultCreated: boolean;
  transactionFinalized: boolean;
};

export type UserProfile = {
  id: string;
  publicKey: string;
  displayName?: string;
  avatarUrl?: string;
  /** Authorization role; gates admin-only navigation and routes. */
  role?: 'user' | 'admin';
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type Vault = {
  id: string;
  name: string;
  assetCode: string;
  assetIssuer?: string;
  ownerPublicKey: string;
  totalAmount: string;
  createdAt: string;
};

export type VestingSchedule = {
  id: string;
  vaultId: string;
  beneficiaryPublicKey: string;
  totalAmount: string;
  vestedAmount: string;
  claimedAmount: string;
  claimableAmount: string;
  startsAt: string;
  endsAt: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
};

export type Claim = {
  id: string;
  subScheduleId: string;
  amount: string;
  transactionHash?: string;
  claimedAt: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
};

export type TokenBalance = {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
};

export type Portfolio = {
  vaults: PaginatedResponse<Vault>;
  tokenBalances: TokenBalance[];
};

export type ClaimVestingInput = {
  vaultId: string;
  subScheduleId: string;
  amount: string;
};

export type CreateVaultInput = {
  name: string;
  assetCode: string;
  assetIssuer?: string;
  totalAmount: string;
  beneficiaryPublicKey: string;
  startsAt: string;
  endsAt: string;
};
