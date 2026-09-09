import '@/global.css';

import { DatabaseProvider } from '@/db/provider';
import { SnoozeResponseHandler } from '@/features/reminders/snooze-handler';
import { useAppFonts } from '@/lib/fonts';
import { useThemePalette, useResolvedColorScheme } from '@/lib/use-color-scheme';
import { NAV_THEME } from '@/lib/theme';
import { useUiStore } from '@/store/ui';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const themeMode = useUiStore((state) => state.themeMode);
  const scheme = useResolvedColorScheme();
  const palette = useThemePalette();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={themeMode}>
        <ThemeProvider value={NAV_THEME[scheme]}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <DatabaseProvider>
            <SnoozeResponseHandler />
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.paper },
                headerTitleStyle: { fontFamily: 'Figtree_600SemiBold', fontSize: 17 },
                headerBackTitle: '',
                contentStyle: { backgroundColor: palette.paper },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="expense/new" options={{ title: 'Add expense' }} />
              <Stack.Screen name="expense/[id]" options={{ title: 'Expense' }} />
              <Stack.Screen name="subscription/new" options={{ title: 'Add subscription' }} />
              <Stack.Screen name="subscription/[id]" options={{ title: 'Subscription' }} />
              <Stack.Screen name="reminder/[taskId]" options={{ title: 'Reminders' }} />
              <Stack.Screen name="reminder/new" options={{ title: 'Add reminder' }} />
              <Stack.Screen name="account/new" options={{ title: 'Add account' }} />
              <Stack.Screen name="account/lookup" options={{ title: 'Look up a service' }} />
              <Stack.Screen name="account/[id]" options={{ title: 'Account' }} />
              <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
              <Stack.Screen name="settings/categories" options={{ title: 'Categories' }} />
              <Stack.Screen name="settings/ticktick" options={{ title: 'TickTick' }} />
              <Stack.Screen name="settings/appearance" options={{ title: 'Appearance' }} />
              <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
              <Stack.Screen name="settings/data" options={{ title: 'Backup' }} />
            </Stack>
          </DatabaseProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
