'use client';

import { useAuthStore } from '@/src/stores/authStore';

/**
 * Whether the connected user has the `admin` role. Gates admin-only
 * navigation and routes. Returns `false` until a profile with a role is loaded.
 */
export function useIsAdmin(): boolean {
  return useAuthStore((state) => state.profile?.role === 'admin');
}
