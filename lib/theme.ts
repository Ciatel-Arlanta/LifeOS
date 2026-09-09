import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export const THEME_MODE_LABEL: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export const PALETTE = {
  paper: '#F4F4F5',
  ink: '#18181B',
  mist: '#71717A',
  line: '#E4E4E7',
  card: '#FFFFFF',
  tape: ['#18181B', '#3F3F46', '#57534E', '#71717A', '#A1A1AA'] as const,
} as const;

export const DARK_PALETTE = {
  paper: '#09090B',
  ink: '#FAFAFA',
  mist: '#A1A1AA',
  line: '#27272A',
  card: '#18181B',
  tape: ['#FAFAFA', '#A1A1AA', '#A8A29E', '#71717A', '#52525B'] as const,
} as const;

/** Chrome colours (headers, tab bar) for a resolved scheme. Tailwind tokens cover the rest. */
export const PALETTES: Record<ColorScheme, typeof PALETTE | typeof DARK_PALETTE> = {
  light: PALETTE,
  dark: DARK_PALETTE,
};

export const NAV_THEME: Record<ColorScheme, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: PALETTE.paper,
      border: PALETTE.line,
      card: PALETTE.card,
      notification: '#B91C1C',
      primary: PALETTE.ink,
      text: PALETTE.ink,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: DARK_PALETTE.paper,
      border: DARK_PALETTE.line,
      card: DARK_PALETTE.card,
      notification: '#EF4444',
      primary: DARK_PALETTE.ink,
      text: DARK_PALETTE.ink,
    },
  },
};
