import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemePreference } from '@/src/types/domain';

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
