import { PALETTE } from '@/lib/theme';
import { Tabs } from 'expo-router';
import { Bell, House, IdCard, Repeat, Wallet } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: PALETTE.paper },
        headerTitleStyle: { fontFamily: 'Figtree_600SemiBold', fontSize: 17, color: PALETTE.ink },
        headerTintColor: PALETTE.ink,
        tabBarActiveTintColor: PALETTE.ink,
        tabBarInactiveTintColor: PALETTE.mist,
        tabBarLabelStyle: { fontFamily: 'Figtree_500Medium', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: PALETTE.card,
          borderTopColor: PALETTE.line,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        sceneStyle: { backgroundColor: PALETTE.paper },
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
