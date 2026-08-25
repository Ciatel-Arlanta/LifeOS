export type Palette = {
  card: `#${string}`;
  border: `#${string}`;
  ink: `#${string}`;
  muted: `#${string}`;
  rule: `#${string}`;
  track: `#${string}`;
  tape: readonly `#${string}`[];
};

export const lightPalette: Palette = {
  card: '#FFFFFF',
  border: '#E4E4E7',
  ink: '#18181B',
  muted: '#71717A',
  rule: '#E4E4E7',
  track: '#F4F4F5',
  tape: ['#18181B', '#3F3F46', '#57534E', '#71717A', '#A1A1AA'] as const,
};

export const darkPalette: Palette = {
  card: '#18181B',
  border: '#27272A',
  ink: '#FAFAFA',
  muted: '#A1A1AA',
  rule: '#27272A',
  track: '#27272A',
  tape: ['#FAFAFA', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B'] as const,
};

export function paletteForTheme(theme: 'light' | 'dark'): Palette {
  return theme === 'dark' ? darkPalette : lightPalette;
}
