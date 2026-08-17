import '@/global.css';

import { DatabaseProvider } from '@/db/provider';
import { useAppFonts } from '@/lib/fonts';
import { NAV_THEME, PALETTE } from '@/lib/theme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useAppFonts();

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={NAV_THEME.light}>
        <StatusBar style="dark" />
        <DatabaseProvider>
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: PALETTE.ink,
              headerStyle: { backgroundColor: PALETTE.paper },
              headerTitleStyle: { fontFamily: 'Figtree_600SemiBold', fontSize: 17 },
              headerBackTitle: '',
              contentStyle: { backgroundColor: PALETTE.paper },
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
            <Stack.Screen name="account/provider/[id]" options={{ title: 'Provider' }} />
            <Stack.Screen name="account/[id]" options={{ title: 'Account' }} />
            <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
            <Stack.Screen name="settings/categories" options={{ title: 'Categories' }} />
            <Stack.Screen name="settings/ticktick" options={{ title: 'TickTick' }} />
          </Stack>
        </DatabaseProvider>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
