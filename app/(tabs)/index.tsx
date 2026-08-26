import { Amount } from '@/components/amount';
import { BootLoading } from '@/components/boot';
import { EmptyState } from '@/components/empty-state';
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
import { describeMonthDelta } from '@/utils/money';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const [monthOffset, setMonthOffset] = useState(0);
  const viewed = new Date(year, month - monthOffset, 1);
  const viewYear = viewed.getFullYear();
  const viewMonth = viewed.getMonth();
  const isCurrentMonth = monthOffset === 0;
  const { expenses, ready: expensesReady } = useExpenseData();
  const { subscriptions, ready: subscriptionsReady } = useSubscriptionData();
  const { openTasks, ready: remindersReady } = useReminderData();

  if (!expensesReady || !subscriptionsReady || !remindersReady) {
    return <BootLoading />;
  }

  const total = monthTotal(expenses, viewYear, viewMonth);
  const shares = categoryBreakdown(expenses, viewYear, viewMonth);
  const renewals = upcomingSubscriptions(subscriptions, 3, now);
  const reminders = upcomingReminders(openTasks, 3);
  const recent = expenses.slice(0, 4);
  const monthRows = expensesForMonth(expenses, viewYear, viewMonth);
  const beforeViewed = new Date(viewYear, viewMonth - 1, 1);
  const deltaLine = describeMonthDelta(
    total,
    monthTotal(expenses, beforeViewed.getFullYear(), beforeViewed.getMonth()),
    formatMonthLabel(beforeViewed.getFullYear(), beforeViewed.getMonth())
  );

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
          accessibilityRole="button"
          accessibilityLabel="Settings"
          className="h-10 w-10 items-center justify-center rounded-full bg-card">
          <Icon as={SettingsIcon} className="text-foreground" size="md" />
        </Pressable>
      </HStack>

      <HStack className="mb-2 items-center justify-between">
        <Pressable
          onPress={() => setMonthOffset((value) => value + 1)}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          className="h-9 w-9 items-center justify-center rounded-full bg-card">
          <Icon as={ChevronLeft} className="text-foreground" size="sm" />
        </Pressable>
        <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
          {formatMonthLabel(viewYear, viewMonth)}
        </Text>
        <Pressable
          onPress={() => setMonthOffset((value) => Math.max(0, value - 1))}
          disabled={isCurrentMonth}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityState={{ disabled: isCurrentMonth }}
          className={`h-9 w-9 items-center justify-center rounded-full bg-card ${
            isCurrentMonth ? 'opacity-30' : ''
          }`}>
          <Icon as={ChevronRight} className="text-foreground" size="sm" />
        </Pressable>
      </HStack>

      {monthRows.length === 0 ? (
        <Card className="px-5 py-6">
          <VStack space="sm">
            <Heading size="3xl" className="font-display">
              ₹0
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              {isCurrentMonth ? 'No spend recorded this month yet.' : 'No expenses this month.'}
            </Text>
          </VStack>
        </Card>
      ) : (
        <MonthTape
          totalMinor={total}
          shares={shares}
          deltaLine={deltaLine}
          subLabel={isCurrentMonth ? 'Spent so far' : 'Total spend'}
        />
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
            <EmptyState
              inline
              title="No upcoming renewals"
              body="Add a subscription to see it here."
            />
          ) : null}
          {renewals.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/subscription/${item.id}`)}
              accessibilityRole="button"
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
            <EmptyState
              inline
              title="No reminders yet"
              body="Open a TickTick task and add one."
            />
          ) : null}
          {reminders.map((item, index) => (
            <Pressable
              key={item.task.id}
              onPress={() => router.push(`/reminder/${item.task.id}`)}
              accessibilityRole="button"
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
          <EmptyState title="No recent spend" body="Add an expense to see it here." />
        ) : (
          <Card className="px-4 py-0">
            {recent.map((expense, index) => (
              <Pressable
                key={expense.id}
                onPress={() => router.push(`/expense/${expense.id}`)}
                accessibilityRole="button"
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
