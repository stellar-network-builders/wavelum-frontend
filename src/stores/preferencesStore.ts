import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  CurrencyDisplay,
  DateFormatPreference,
  NotificationPreferences,
} from '@/src/types/domain';

type PreferencesState = {
  currencyDisplay: CurrencyDisplay;
  dateFormat: DateFormatPreference;
  notifications: NotificationPreferences;
  setCurrencyDisplay: (currencyDisplay: CurrencyDisplay) => void;
  setDateFormat: (dateFormat: DateFormatPreference) => void;
  setNotificationPreference: (
    key: keyof NotificationPreferences,
    enabled: boolean,
  ) => void;
  resetPreferences: () => void;
};

const defaultNotifications: NotificationPreferences = {
  claimAvailable: true,
  vaultCreated: true,
  transactionFinalized: true,
};

const defaultPreferences = {
  currencyDisplay: 'native' as const,
  dateFormat: 'relative' as const,
  notifications: defaultNotifications,
};

/**
 * Client-only preferences store (Zustand).
 *
 * Holds user UI preferences only: currency display, date format, and
 * notification toggles. Server-derived data must live in TanStack Query,
 * never here. See docs/STATE_MANAGEMENT.md for the state management
 * decision tree and conventions.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setCurrencyDisplay: (currencyDisplay) => set({ currencyDisplay }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setNotificationPreference: (key, enabled) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: enabled,
          },
        })),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'lumina-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
