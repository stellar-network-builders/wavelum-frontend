import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfile, WalletStatus } from '@/src/types/domain';

type AuthState = {
  status: WalletStatus;
  publicKey: string | null;
  token: string | null;
  profile: UserProfile | null;
  setConnecting: () => void;
  setConnected: (publicKey: string) => void;
  setAuthenticated: (token: string, profile?: UserProfile | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  disconnect: () => void;
};

const initialAuthState = {
  status: 'disconnected' as const,
  publicKey: null,
  token: null,
  profile: null,
};

export const useAuthStore = create<AuthState>()(
  /*
   * Only non-sensitive fields are persisted to localStorage. The JWT token is
   * intentionally NOT persisted so it cannot be exfiltrated by XSS — the user
   * re-authenticates on every full page reload.
   */
  persist(
    (set) => ({
      ...initialAuthState,
      setConnecting: () => set({ status: 'connecting' }),
      setConnected: (publicKey) =>
        set({ status: 'connected', publicKey, token: null, profile: null }),
      setAuthenticated: (token, profile = null) =>
        set((state) => ({
          status: 'authenticated',
          token,
          profile,
          publicKey: profile?.publicKey ?? state.publicKey,
        })),
      setProfile: (profile) => set({ profile }),
      disconnect: () => set(initialAuthState),
    }),
    {
      name: 'lumina-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ status, publicKey, profile }) => ({
        status,
        publicKey,
        profile,
      }),
    },
  ),
);
