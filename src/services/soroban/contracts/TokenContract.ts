/**
 * Token contract wrapper.
 *
 * Type-safe methods for querying Stellar token contract state:
 * balance, name, symbol, decimals, and total supply.
 *
 * SDK v16: uses `Contract.call()`, `server.simulateTransaction()`, and `scValToNative`.
 */

import type { xdr } from '@stellar/stellar-sdk';
import { scValToNative } from '@stellar/stellar-sdk';

import { resolveContractAddress } from '../contracts';
import { parseSorobanError } from '../errors';
import { buildReadOnlyTx } from '../helpers';
import { getSorobanClient } from '../sorobanClient';
import type { TokenBalanceInfo } from '../types';

/* ─── Contract Wrapper ───────────────────────────────────────────────────── */

export class TokenContract {
  private readonly contractId: string;

  constructor() {
    this.contractId = resolveContractAddress('token');
  }

  /** Execute a read-only contract call and decode the result ScVal */
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

  async balance(address: string): Promise<string> {
    return String(await this.read('balance', { address } as unknown as xdr.ScVal) ?? '0');
  }

  async name(): Promise<string> {
    return String(await this.read('name') ?? '');
  }

  async symbol(): Promise<string> {
    return String(await this.read('symbol') ?? '');
  }

  async decimals(): Promise<number> {
    return Number(await this.read('decimals') ?? 7);
  }

  async totalSupply(): Promise<string> {
    return String(await this.read('total_supply') ?? '0');
  }

  async getTokenBalance(address: string): Promise<TokenBalanceInfo> {
    const [balance, symb, decs] = await Promise.all([
      this.balance(address),
      this.symbol(),
      this.decimals(),
    ]);

    return {
      address,
      balance,
      contractId: this.contractId,
      symbol: symb,
      decimals: decs,
    };
  }
}
