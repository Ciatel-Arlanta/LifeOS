import { useThemePalette } from '@/lib/use-color-scheme';
import { Tabs } from 'expo-router';
import { Bell, House, IdCard, Repeat, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const palette = useThemePalette();
  const bottomPadding = Math.max(insets.bottom, 12);
  const tabHeight = 54 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.paper },
        headerTitleStyle: { fontFamily: 'Figtree_600SemiBold', fontSize: 17, color: palette.ink },
        headerTintColor: palette.ink,
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.mist,
        tabBarLabelStyle: { fontFamily: 'Figtree_500Medium', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.line,
          height: tabHeight,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
        sceneStyle: { backgroundColor: palette.paper },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <House color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <Wallet color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => <Repeat color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, size }) => <Bell color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => <IdCard color={String(color)} size={size} />,
        }}
      />
    </Tabs>
  );
}
