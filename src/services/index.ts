/**
 * Services module barrel export.
 */
export { ApiClient, createSorobanClient } from './api';
export type { ApiClientConfig, ApiResponse, ApiError } from './api';

export { apiClient, registerTokenGetter, registerUnauthorizedHandler } from './api/client';
export { queryKeys } from './api/queryKeys';
export type { QueryKeys } from './api/queryKeys';

export { vestingService } from './vestingService';
export type { Vault, VaultListResponse, VaultFilters, SubSchedule, VestingEvent, ClaimRequest, ClaimResponse } from './vestingService';

export { authService } from './authService';
export type { Sep10Challenge, AuthToken, Sep10SubmitRequest, AuthSession } from './authService';

export { portfolioService } from './portfolioService';
export type { PortfolioSummary, TokenBalance, ClaimHistory } from './portfolioService';

export { adminService } from './adminService';
export type { AdminUser, AdminUserFilters, KycApprovalBody, VaultActionResponse } from './adminService';
