import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>Local data</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            Expenses, subscriptions, and accounts stay on this device. TickTick is connected from
            here when you want lists.
          </Text>
        </Card>

        <Card className="px-4 py-0">
          <Pressable
            onPress={() => router.push('/settings/categories')}
            className="border-b border-border py-4">
            <Text bold>Expense categories</Text>
            <Text size="sm" className="mt-1 text-muted-foreground">
              Kept out of the daily expense screen
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings/ticktick')}
            className="border-b border-border py-4">
            <Text bold>TickTick</Text>
            <Text size="sm" className="mt-1 text-muted-foreground">
              Connection lives here
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/account/lookup')} className="py-4">
            <Text bold>Look up a service</Text>
            <Text size="sm" className="mt-1 text-muted-foreground">
              Which sign-in identity did I use?
            </Text>
          </Pressable>
        </Card>

        <Text size="xs" className="font-mono text-muted-foreground">
          Currency is INR. LifeOS never stores passwords.
        </Text>
      </VStack>
    </Screen>
  );
}
