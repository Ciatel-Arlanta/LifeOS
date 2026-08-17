import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export const PALETTE = {
  paper: '#F4F4F5',
  ink: '#18181B',
  mist: '#71717A',
  line: '#E4E4E7',
  card: '#FFFFFF',
  tape: ['#18181B', '#3F3F46', '#57534E', '#71717A', '#A1A1AA'] as const,
} as const;

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
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
      background: '#09090B',
      border: '#27272A',
      card: '#18181B',
      notification: '#EF4444',
      primary: '#FAFAFA',
      text: '#FAFAFA',
    },
  },
};
