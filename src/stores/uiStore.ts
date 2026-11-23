import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemePreference } from '@/src/types/domain';

/**
 * Global UI store (client state).
 *
 * This store intentionally holds only app-wide UI state: sidebar collapse,
 * theme preference, and the currently active modal. See
 * `docs/STATE_MANAGEMENT.md` for the state management decision tree:
 * - Server state: TanStack Query
 * - Client state: Zustand (this store)
 * - Form state: React Hook Form + Zod
 * - URL state: next/navigation useSearchParams
 * - Component state: useState/useReducer
 *
 * Transient, per-component UI state (e.g. whether a single dropdown is open,
 * hover/focus flags, local input drafts) should stay in `useState`/`useReducer`
 * within the component and must NOT be promoted to this global store.
 */

type ModalName = 'connectWallet' | 'createVault' | 'claimVesting';

type UiState = {
  isSidebarCollapsed: boolean;
  theme: ThemePreference;
  activeModal: ModalName | null;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemePreference) => void;
  openModal: (modal: ModalName) => void;
  closeModal: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      theme: 'system',
      activeModal: null,
      setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      openModal: (activeModal) => set({ activeModal }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'lumina-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ isSidebarCollapsed, theme }) => ({
        isSidebarCollapsed,
        theme,
      }),
    },
  ),
);