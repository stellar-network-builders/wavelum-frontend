/**
 * VestingVault contract wrapper.
 *
 * Type-safe methods for reading and interacting with the VestingVault
 * Soroban smart contract.
 *
 * SDK v16: read calls use `simulateTransaction`; write calls build
 * transactions for wallet signing.
 */

import type { xdr } from '@stellar/stellar-sdk';
import { Contract, Account, TransactionBuilder, scValToNative } from '@stellar/stellar-sdk';

import { getSorobanConfig } from '@/config/soroban';

import { resolveContractAddress } from '../contracts';
import { parseSorobanError } from '../errors';
import { buildReadOnlyTx } from '../helpers';
import { getSorobanClient } from '../sorobanClient';
import type {
  VaultInfo,
  SubScheduleInfo,
  ClaimParams,
  GetClaimableAmountParams,
  GetSubScheduleParams,
} from '../types';

/* ─── Contract Wrapper ───────────────────────────────────────────────────── */

export class VestingVaultContract {
  private readonly contractId: string;

  constructor() {
    this.contractId = resolveContractAddress('vestingVault');
  }

  private async read(method: string, ...args: xdr.ScVal[]): Promise<unknown> {
    try {
      const server = getSorobanClient();
      const result = await server.simulateTransaction(
        buildReadOnlyTx(this.contractId, method, ...args).build(),
      );

      if ('result' in result) {
        const retval = result.result?.retval;
        return retval ? scValToNative(retval) : null;
      }

      if ('error' in result) throw result.error;
      return null;
    } catch (error) {
      throw new Error(parseSorobanError(error));
    }
  }

  async getVault(vaultId: string): Promise<VaultInfo> {
    const result = await this.read('get_vault', { vault_id: vaultId } as unknown as xdr.ScVal);
    return result as VaultInfo;
  }

  async getSubSchedule(params: GetSubScheduleParams): Promise<SubScheduleInfo> {
    const result = await this.read('get_sub_schedule', params as unknown as xdr.ScVal);
    return result as SubScheduleInfo;
  }

  async getClaimableAmount(params: GetClaimableAmountParams): Promise<string> {
    return String(await this.read('get_claimable_amount', params as unknown as xdr.ScVal) ?? '0');
  }

  async getBeneficiaryBalance(beneficiary: string): Promise<string> {
    return String(await this.read('get_beneficiary_balance', { beneficiary } as unknown as xdr.ScVal) ?? '0');
  }

  /** Build a claim transaction for wallet signing */
  async buildClaimTransaction(params: ClaimParams) {
    try {
      const contract = new Contract(this.contractId);
      const op = contract.call('claim', params as unknown as xdr.ScVal);

      const config = getSorobanConfig();
      const txBuilder = new TransactionBuilder(
        new Account(params.beneficiary, '0'),
        { fee: '100', networkPassphrase: config.networkPassphrase },
      )
        .addOperation(op)
        .setTimeout(300);

      const server = getSorobanClient();
      const simResult = await server.simulateTransaction(txBuilder.build());

      return {
        transactionXdr: txBuilder.build().toXDR(),
        simulation: simResult,
        suggestedFee: '100000',
      };
    } catch (error) {
      throw new Error(parseSorobanError(error));
    }
  }
}
