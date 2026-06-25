/**
 * Soroban transaction builder.
 *
 * Orchestrates the full lifecycle of a Soroban transaction:
 * Simulate (get fee estimate & auth) → Sign (via wallet) → Submit → Poll
 */

import type { TransactionBuilder } from '@stellar/stellar-sdk';

import { parseSorobanError } from './errors';
import {
  simulateTransaction,
  sendTransaction,
  getTransaction,
} from './sorobanClient';

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface SimulatedTransaction {
  transactionXdr: string;
  simulation: Awaited<ReturnType<typeof simulateTransaction>>;
  suggestedFee: string;
}

export interface SubmitResult {
  hash: string;
  status: string;
  confirmation: Awaited<ReturnType<typeof getTransaction>> | null;
}

/* ─── Builder ────────────────────────────────────────────────────────────── */

export class SorobanTransactionBuilder {
  async simulate(tx: TransactionBuilder): Promise<SimulatedTransaction> {
    try {
      const sim = await simulateTransaction(tx);
      const txXdr = tx.build().toXDR();
      return {
        transactionXdr: txXdr,
        simulation: sim,
        suggestedFee: '100000',
      };
    } catch (error) {
      throw new Error(parseSorobanError(error));
    }
  }

  /**
   * Submit a signed transaction XDR to the network.
   */
  async submit(signedXdr: string) {
    try {
      return await sendTransaction(signedXdr);
    } catch (error) {
      throw new Error(parseSorobanError(error));
    }
  }

  /**
   * Poll for transaction confirmation with retries.
   */
  async pollConfirmation(
    hash: string,
    maxAttempts: number = 20,
    intervalMs: number = 2000,
  ) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      try {
        const result = await getTransaction(hash);
        if (result.status === 'SUCCESS' || result.status === 'FAILED') {
          return result;
        }
      } catch {
        if (attempt === maxAttempts - 1) {
          throw new Error('Transaction confirmation timed out.');
        }
      }
    }
    throw new Error('Transaction confirmation timed out.');
  }

  /**
   * Full flow: Simulate → Sign (via callback) → Submit → Poll.
   */
  async execute(
    tx: TransactionBuilder,
    signAndSubmit: (sim: SimulatedTransaction) => Promise<string>,
  ): Promise<SubmitResult> {
    const sim = await this.simulate(tx);
    const signedXdr = await signAndSubmit(sim);
    const sendResult = await this.submit(signedXdr);
    const sendObj = sendResult as unknown as { hash: string; status: string };
    const confirmation = await this.pollConfirmation(sendObj.hash);

    return {
      hash: sendObj.hash,
      status: sendObj.status,
      confirmation,
    };
  }
}
