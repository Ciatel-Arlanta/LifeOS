import { getPreference, setPreference } from '@/lib/preferences';
import { THEME_MODES, type ThemeMode } from '@/lib/theme';
import { create } from 'zustand';

type TickTickStatus = 'disconnected' | 'connecting' | 'connected';

const THEME_KEY = 'lifeos.theme-mode';
const RENEWAL_LEAD_KEY = 'lifeos.renewal-lead-days';

/** 0 disables renewal reminders. */
export const RENEWAL_LEAD_CHOICES = [0, 1, 2, 3, 7] as const;
export const DEFAULT_RENEWAL_LEAD_DAYS = 2;

function readThemeMode(): ThemeMode {
  const stored = getPreference(THEME_KEY);
  return THEME_MODES.includes(stored as ThemeMode) ? (stored as ThemeMode) : 'system';
}

function readRenewalLeadDays(): number {
  const raw = getPreference(RENEWAL_LEAD_KEY);
  if (raw === null) return DEFAULT_RENEWAL_LEAD_DAYS;
  const stored = Number(raw);
  return RENEWAL_LEAD_CHOICES.includes(stored as (typeof RENEWAL_LEAD_CHOICES)[number])
    ? stored
    : DEFAULT_RENEWAL_LEAD_DAYS;
}

type UiState = {
  ticktickStatus: TickTickStatus;
  setTicktickStatus: (status: TickTickStatus) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  renewalLeadDays: number;
  setRenewalLeadDays: (days: number) => void;
};

/** Client-only UI state. Persistent records live in SQLite, not here. */
export const useUiStore = create<UiState>((set) => ({
  ticktickStatus: 'disconnected',
  setTicktickStatus: (ticktickStatus) => set({ ticktickStatus }),
  themeMode: readThemeMode(),
  setThemeMode: (themeMode) => {
    setPreference(THEME_KEY, themeMode);
    set({ themeMode });
  },
  renewalLeadDays: readRenewalLeadDays(),
  setRenewalLeadDays: (renewalLeadDays) => {
    setPreference(RENEWAL_LEAD_KEY, String(renewalLeadDays));
    set({ renewalLeadDays });
  },
}));
