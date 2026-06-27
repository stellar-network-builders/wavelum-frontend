'use client';

import { CaretDown, Check, Copy, Globe, SignOut, Wallet } from '@phosphor-icons/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';

import { sanitizeAddress } from '@/src/lib/security';

import type { WalletNetwork } from './types';
import { useWallet } from './useWallet';

const NETWORKS: WalletNetwork[] = ['testnet', 'mainnet', 'futurenet'];

const itemClass =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none transition-colors data-[highlighted]:bg-zinc-100 dark:text-zinc-200 dark:data-[highlighted]:bg-zinc-800';

/**
 * Connected-account dropdown: shows the truncated public key with a copy
 * action, the active/target network with a switcher, and disconnect.
 */
export function WalletDropdown() {
  const { publicKey, network, targetNetwork, isWrongNetwork, switchNetwork, disconnect } =
    useWallet();
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — ignore.
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Wallet className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono">{publicKey ? sanitizeAddress(publicKey) : 'Account'}</span>
          {isWrongNetwork && (
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-label="Wrong network" />
          )}
          <CaretDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[240px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="px-2 py-1.5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Connected account</p>
            <p className="mt-0.5 break-all font-mono text-sm text-zinc-900 dark:text-zinc-50">
              {publicKey ? sanitizeAddress(publicKey) : '—'}
            </p>
          </div>

          <DropdownMenu.Item className={itemClass} onSelect={(e) => { e.preventDefault(); copyAddress(); }}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy address'}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          <DropdownMenu.Label className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
            Network{network ? ` · wallet on ${network}` : ''}
          </DropdownMenu.Label>
          {NETWORKS.map((net) => (
            <DropdownMenu.Item
              key={net}
              className={itemClass}
              onSelect={() => switchNetwork(net)}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="capitalize">{net}</span>
              {targetNetwork === net && (
                <Check className="ml-auto h-4 w-4 text-emerald-500" aria-hidden="true" />
              )}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          <DropdownMenu.Item
            className={`${itemClass} text-red-600 data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950`}
            onSelect={disconnect}
          >
            <SignOut className="h-4 w-4" aria-hidden="true" />
            Disconnect
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
