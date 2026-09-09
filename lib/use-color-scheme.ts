import { PALETTES, type ColorScheme } from '@/lib/theme';
import { useUiStore } from '@/store/ui';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

/**
 * The scheme actually in effect: the stored preference, or the device setting when
 * the preference is `system`.
 */
export function useResolvedColorScheme(): ColorScheme {
  const mode = useUiStore((state) => state.themeMode);
  const device = useDeviceColorScheme();
  if (mode === 'system') return device === 'dark' ? 'dark' : 'light';
  return mode;
}

/** Chrome colours (headers, tab bar) for the scheme in effect. */
export function useThemePalette() {
  return PALETTES[useResolvedColorScheme()];
}
