'use client';

/**
 * Wires the runtime integrations into the Axios `apiClient`:
 *
 * - token getter        → reads the JWT from the auth store
 * - unauthorized handler → on 401, clear auth and open the connect-wallet modal
 * - toast handler        → surfaces 403/5xx errors through <ToastProvider>
 *
 * Must be mounted inside <ToastProvider> (it depends on `useToast`).
 * Renders nothing; it only registers callbacks on mount.
 */

import { useEffect } from 'react';

import { useToast } from '@/components/ui';

import {
  registerTokenGetter,
  registerUnauthorizedHandler,
  registerToastHandler,
} from '@/src/services/api/client';
import { useAuthStore } from '@/src/stores/authStore';
import { useUiStore } from '@/src/stores/uiStore';

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    registerTokenGetter(() => useAuthStore.getState().token);

    registerUnauthorizedHandler(() => {
      useAuthStore.getState().disconnect();
      useUiStore.getState().openModal('connectWallet');
    });

    registerToastHandler((payload) => toast(payload));
  }, [toast]);

  return <>{children}</>;
}
