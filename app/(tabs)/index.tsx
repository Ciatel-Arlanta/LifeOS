import { Amount } from '@/components/amount';
import { MonthTape } from '@/components/month-tape';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SettingsIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  categoryBreakdown,
  expensesForMonth,
  monthTotal,
  useExpenseData,
} from '@/features/expenses/store';
import { TRANSACTION_MODE_LABEL } from '@/features/expenses/types';
import { upcomingReminders, useReminderData } from '@/features/reminders/store';
import {
  monthlyCommitmentMinor,
  upcomingSubscriptions,
  useSubscriptionData,
} from '@/features/subscriptions/store';
import { formatMonthLabel, formatRelativeDay, formatWeekdayDate } from '@/utils/date';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const { expenses } = useExpenseData();
  const { subscriptions } = useSubscriptionData();
  const { openTasks } = useReminderData();
  const total = monthTotal(expenses, year, month);
  const shares = categoryBreakdown(expenses, year, month);
  const renewals = upcomingSubscriptions(subscriptions, 3, now);
  const reminders = upcomingReminders(openTasks, 3);
  const recent = expenses.slice(0, 4);
  const monthRows = expensesForMonth(expenses, year, month);

  return (
    <Screen>
      <HStack className="mb-6 items-start justify-between" style={{ paddingTop: insets.top + 4 }}>
        <VStack space="xs" className="flex-1 pr-4">
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            LifeOS
          </Text>
          <Heading size="2xl" className="font-display">
            Today’s ledger
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            {formatWeekdayDate(now)}
          </Text>
        </VStack>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          className="h-10 w-10 items-center justify-center rounded-full bg-card">
          <Icon as={SettingsIcon} className="text-foreground" size="md" />
        </Pressable>
      </HStack>

      {monthRows.length === 0 ? (
        <Card className="px-5 py-6">
          <VStack space="sm">
            <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
              {formatMonthLabel(year, month)}
            </Text>
            <Heading size="3xl" className="font-display">
              ₹0
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              No spend recorded this month yet.
            </Text>
          </VStack>
        </Card>
      ) : (
        <MonthTape monthLabel={formatMonthLabel(year, month)} totalMinor={total} shares={shares} />
      )}

      <Button className="mt-4" onPress={() => router.push('/expense/new')}>
        <ButtonIcon as={Plus} />
        <ButtonText>Add expense</ButtonText>
      </Button>

      <Box className="mt-8">
        <SectionHeader
          title="Coming up"
          actionLabel="See bills"
          onAction={() => router.push('/subscriptions')}
        />
        <Card className="px-4 py-0">
          <HStack className="items-baseline justify-between border-b border-border py-3">
            <Text size="sm" className="text-muted-foreground">
              Monthly commitments
            </Text>
            <Amount minor={monthlyCommitmentMinor(subscriptions)} size="sm" />
          </HStack>
          {renewals.length === 0 ? (
            <Text size="sm" className="py-3.5 text-muted-foreground">
              No upcoming renewals
            </Text>
          ) : null}
          {renewals.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/subscription/${item.id}`)}
              className={`flex-row items-center justify-between py-3.5 ${
                index < renewals.length - 1 ? 'border-b border-border' : ''
              }`}>
              <VStack space="xs" className="flex-1 pr-3">
                <Text bold>{item.name}</Text>
                <Text size="xs" className="font-mono text-muted-foreground">
                  {formatRelativeDay(item.renewalDate, now)}
                </Text>
              </VStack>
              <Amount minor={item.costMinor} size="sm" />
            </Pressable>
          ))}
        </Card>
      </Box>

      <Box className="mt-8">
        <SectionHeader
          title="Next reminders"
          actionLabel="Open"
          onAction={() => router.push('/reminders')}
        />
        <Card className="px-4 py-0">
          {reminders.length === 0 ? (
            <Text size="sm" className="py-3.5 text-muted-foreground">
              No LifeOS reminders yet
            </Text>
          ) : null}
          {reminders.map((item, index) => (
            <Pressable
              key={item.task.id}
              onPress={() => router.push(`/reminder/${item.task.id}`)}
              className={`py-3.5 ${index < reminders.length - 1 ? 'border-b border-border' : ''}`}>
              <Text bold>{item.task.title}</Text>
              <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                {item.task.listName} · {item.next.fireAtLabel}
              </Text>
            </Pressable>
          ))}
        </Card>
      </Box>

      <Box className="mt-8">
        <SectionHeader title="Recent spend" actionLabel="All" onAction={() => router.push('/expenses')} />
        {recent.length === 0 ? (
          <Text size="sm" className="text-muted-foreground">
            Add an expense to see it here.
          </Text>
        ) : (
          <Card className="px-4 py-0">
            {recent.map((expense, index) => (
              <Pressable
                key={expense.id}
                onPress={() => router.push(`/expense/${expense.id}`)}
                className={`flex-row items-center justify-between py-3.5 ${
                  index < recent.length - 1 ? 'border-b border-border' : ''
                }`}>
                <VStack space="xs" className="flex-1 pr-3">
                  <Text bold>{expense.categoryName}</Text>
                  <Text size="xs" className="font-mono text-muted-foreground">
                    {TRANSACTION_MODE_LABEL[expense.transactionMode]}
                  </Text>
                </VStack>
                <Amount minor={expense.amountMinor} size="sm" />
              </Pressable>
            ))}
          </Card>
        )}
      </Box>
    </Screen>
  );
}
