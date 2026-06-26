/**
 * Soroban error mapping.
 *
 * Converts Soroban RPC error codes and contract-level error types
 * into user-friendly messages suitable for toast notifications.
 */

/* ─── Error Types ────────────────────────────────────────────────────────── */

export interface SorobanContractError {
  type: string;
  code: number;
  message?: string;
}

/* ─── Contract Error Codes ───────────────────────────────────────────────── */

/**
 * VestingVault contract error codes mapped to human-readable messages.
 */
const VESTING_VAULT_ERRORS: Record<number, string> = {
  1: 'You are not authorized to perform this action on the vault.',
  2: 'The vault does not exist. Please check the vault ID.',
  3: 'The sub-schedule does not exist for this vault.',
  4: 'The vesting schedule has not started yet.',
  5: 'The vesting cliff period has not been reached.',
  6: 'No tokens are currently claimable. Check the next claim date.',
  7: 'The requested claim amount exceeds the claimable balance.',
  8: 'This vault has been paused by the administrator.',
  9: 'The vault has already completed vesting. No further claims are possible.',
  10: 'The vault has expired. Contact the administrator.',
  11: 'Invalid beneficiary address.',
  12: 'The provided token amount is invalid.',
};

/**
 * Token contract error codes.
 */
const TOKEN_ERRORS: Record<number, string> = {
  1: 'Insufficient token balance for this operation.',
  2: 'You are not authorized to transfer these tokens.',
  3: 'The spender allowance is insufficient.',
};

/* ─── RPC Error Codes ────────────────────────────────────────────────────── */

/**
 * Soroban RPC-level error codes mapped to messages.
 */
const RPC_ERRORS: Record<string, string> = {
  '-32000': 'The contract call failed. The transaction may be invalid.',
  '-32001': 'The requested ledger entry was not found.',
  '-32002': 'The transaction simulation failed. Try again.',
  '-32003': 'The transaction budget was exceeded. Try a smaller operation.',
  '-32004': 'The network is currently unavailable. Please try again later.',
  '-32600': 'The request was invalid. Please check your inputs.',
  '-32601': 'The requested method is not available on this network.',
  '-32602': 'Invalid parameters were provided to the contract call.',
  '-32603': 'An internal RPC error occurred. Please try again.',
};

/* ─── Mapping Functions ──────────────────────────────────────────────────── */

/**
 * Map a Soroban RPC error code to a user-friendly message.
 *
 * @param code - The JSON-RPC error code (e.g. -32000).
 * @returns A human-readable error message.
 */
export function mapRpcError(code: number): string {
  const key = String(code);
  return RPC_ERRORS[key] ?? `An unexpected network error occurred (code: ${code}).`;
}

/**
 * Map a Soroban contract-level error to a user-friendly message.
 *
 * @param contractName - The contract that threw the error.
 * @param errorCode    - The contract-specific error code.
 * @returns A human-readable error message.
 */
export function mapContractError(
  contractName: 'vestingVault' | 'token' | string,
  errorCode: number,
): string {
  switch (contractName) {
    case 'vestingVault':
      return VESTING_VAULT_ERRORS[errorCode] ?? `Vesting contract error (code: ${errorCode}).`;
    case 'token':
      return TOKEN_ERRORS[errorCode] ?? `Token contract error (code: ${errorCode}).`;
    default:
      return `Contract error (code: ${errorCode}) from ${contractName}.`;
  }
}

/**
 * Parse a Soroban error response and return a user-friendly message.
 *
 * Handles both RPC-level errors (jsonrpc error object) and contract-level
 * errors (nested ContractError in the error data). When both are present,
 * the contract-level error wins because it carries the more specific
 * cause of the failure.
 *
 * @param error - The raw error from a Soroban RPC call.
 * @returns A user-friendly error message.
 */
export function parseSorobanError(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Contract-level error embedded in `data` is more specific than the
    // generic RPC-level code, so prefer it when both are present.
    if (err.data && typeof err.data === 'object') {
      const data = err.data as Record<string, unknown>;
      if (data.type === 'ContractError' && typeof data.code === 'number') {
        return mapContractError('vestingVault', data.code as number);
      }
    }

    // RPC-level error (fallback when there is no embedded ContractError).
    if (typeof err.code === 'number') {
      return mapRpcError(err.code as number);
    }

    if (typeof err.message === 'string') {
      return err.message;
    }
  }

  return 'An unknown error occurred during the Soroban operation.';
}
