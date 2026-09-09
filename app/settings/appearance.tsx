import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { tapLight } from '@/lib/haptics';
import { THEME_MODES, THEME_MODE_LABEL, type ThemeMode } from '@/lib/theme';
import { useResolvedColorScheme } from '@/lib/use-color-scheme';
import { useUiStore } from '@/store/ui';

export default function AppearanceSettingsScreen() {
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const scheme = useResolvedColorScheme();

  function choose(mode: ThemeMode) {
    if (mode === themeMode) return;
    tapLight();
    setThemeMode(mode);
  }

  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>Theme</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            System follows your phone's light and dark setting.
          </Text>
          <HStack space="sm" className="mt-4 flex-wrap">
            {THEME_MODES.map((mode) => (
              <Chip
                key={mode}
                label={THEME_MODE_LABEL[mode]}
                selected={themeMode === mode}
                onPress={() => choose(mode)}
              />
            ))}
          </HStack>
          <Text size="xs" className="mt-4 font-mono uppercase tracking-widest text-muted-foreground">
            Showing {scheme}
          </Text>
        </Card>
      </VStack>
    </Screen>
  );
}
