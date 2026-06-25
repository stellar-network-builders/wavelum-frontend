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
