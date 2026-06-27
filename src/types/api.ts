/**
 * Auto-generated TypeScript types for the lumina-backend OpenAPI schema.
 *
 * ⚠️  Do not edit the `paths` / `components` shapes by hand in normal operation.
 *     Regenerate from the backend's live OpenAPI document with:
 *
 *         npm run generate:types
 *
 *     (runs `openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json`).
 *
 * This checked-in copy is the fallback used in environments without backend
 * access (CI without a running API, local offline development). It mirrors the
 * structure `openapi-typescript` emits — a `paths` interface keyed by route and
 * a `components.schemas` namespace — so consumers can switch to the generated
 * file with no code changes.
 */

/* ─── Schemas ────────────────────────────────────────────────────────────── */

export interface components {
  schemas: {
    /** Pagination envelope returned by every list endpoint. */
    PaginatedResponse_Vault: {
      items: components['schemas']['Vault'][];
      page: number;
      pageSize: number;
      total: number;
    };
    PaginatedResponse_AdminUser: {
      items: components['schemas']['AdminUser'][];
      page: number;
      pageSize: number;
      total: number;
    };

    Vault: {
      id: string;
      name: string;
      assetCode: string;
      assetIssuer?: string;
      ownerPublicKey: string;
      /** Stringified decimal to preserve precision. */
      totalAmount: string;
      /** Whether admin operations have paused claims on this vault. */
      paused?: boolean;
      createdAt: string;
    };

    /** A vesting sub-schedule (one beneficiary's slice of a vault). */
    SubSchedule: {
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

    Claim: {
      id: string;
      subScheduleId: string;
      amount: string;
      transactionHash?: string;
      claimedAt: string;
      status: 'pending' | 'submitted' | 'confirmed' | 'failed';
    };

    ClaimRequest: {
      amount: string;
    };

    TokenBalance: {
      assetCode: string;
      assetIssuer?: string;
      balance: string;
    };

    PortfolioSummary: {
      vaults: components['schemas']['PaginatedResponse_Vault'];
      tokenBalances: components['schemas']['TokenBalance'][];
    };

    /* ─── Auth (SEP-10 Stellar Web Auth) ─────────────────────────────────── */

    /** SEP-10 challenge transaction the client must sign with its wallet. */
    Sep10Challenge: {
      /** Base64-encoded unsigned challenge transaction (XDR). */
      transaction: string;
      /** Stellar network passphrase the challenge is bound to. */
      networkPassphrase: string;
    };

    /** Signed-challenge submission. */
    Sep10TokenRequest: {
      /** Base64-encoded signed challenge transaction (XDR). */
      transaction: string;
    };

    /** JWT session token issued after a successful SEP-10 exchange. */
    Sep10TokenResponse: {
      token: string;
      /** Unix epoch (ms) at which the token expires. */
      expiresAt: number;
    };

    /* ─── Admin ──────────────────────────────────────────────────────────── */

    AdminUser: {
      id: string;
      publicKey: string;
      displayName?: string;
      email?: string;
      role: 'user' | 'admin';
      kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
      createdAt: string;
    };

    /** Standard error body returned by the backend on non-2xx responses. */
    ApiErrorBody: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
}

/* ─── Convenience aliases ────────────────────────────────────────────────── */

export type Schemas = components['schemas'];

export type Sep10Challenge = Schemas['Sep10Challenge'];
export type Sep10TokenRequest = Schemas['Sep10TokenRequest'];
export type Sep10TokenResponse = Schemas['Sep10TokenResponse'];
export type AdminUser = Schemas['AdminUser'];
export type ApiErrorBody = Schemas['ApiErrorBody'];

/* ─── Paths ──────────────────────────────────────────────────────────────── */

export interface paths {
  '/vaults': {
    get: {
      parameters: { query?: { page?: number; pageSize?: number } };
      responses: { 200: { content: { 'application/json': Schemas['PaginatedResponse_Vault'] } } };
    };
    post: {
      requestBody: { content: { 'application/json': unknown } };
      responses: { 201: { content: { 'application/json': Schemas['Vault'] } } };
    };
  };
  '/vaults/{vaultId}': {
    get: {
      parameters: { path: { vaultId: string } };
      responses: { 200: { content: { 'application/json': Schemas['Vault'] } } };
    };
  };
  '/vaults/{vaultId}/vestings': {
    get: {
      parameters: { path: { vaultId: string } };
      responses: { 200: { content: { 'application/json': Schemas['SubSchedule'][] } } };
    };
  };
  '/vestings/{subScheduleId}/claims': {
    get: {
      parameters: { path: { subScheduleId: string } };
      responses: { 200: { content: { 'application/json': Schemas['Claim'][] } } };
    };
    post: {
      parameters: { path: { subScheduleId: string } };
      requestBody: { content: { 'application/json': Schemas['ClaimRequest'] } };
      responses: { 201: { content: { 'application/json': Schemas['Claim'] } } };
    };
  };
  '/portfolio/token-balances': {
    get: {
      responses: { 200: { content: { 'application/json': Schemas['TokenBalance'][] } } };
    };
  };
  '/auth/sep10/challenge': {
    get: {
      parameters: { query: { account: string } };
      responses: { 200: { content: { 'application/json': Schemas['Sep10Challenge'] } } };
    };
  };
  '/auth/sep10/token': {
    post: {
      requestBody: { content: { 'application/json': Schemas['Sep10TokenRequest'] } };
      responses: { 200: { content: { 'application/json': Schemas['Sep10TokenResponse'] } } };
    };
  };
  '/auth/refresh': {
    post: {
      responses: { 200: { content: { 'application/json': Schemas['Sep10TokenResponse'] } } };
    };
  };
  '/admin/users': {
    get: {
      parameters: { query?: { page?: number; pageSize?: number } };
      responses: { 200: { content: { 'application/json': Schemas['PaginatedResponse_AdminUser'] } } };
    };
  };
  '/admin/users/{userId}/kyc/approve': {
    post: {
      parameters: { path: { userId: string } };
      responses: { 200: { content: { 'application/json': Schemas['AdminUser'] } } };
    };
  };
  '/admin/vaults/{vaultId}/pause': {
    post: {
      parameters: { path: { vaultId: string } };
      responses: { 200: { content: { 'application/json': Schemas['Vault'] } } };
    };
  };
}
