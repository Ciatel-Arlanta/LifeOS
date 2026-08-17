import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseData } from '@/features/expenses/store';
import { TRANSACTION_MODE_LABEL, type Expense } from '@/features/expenses/types';
import { formatDayHeading } from '@/utils/date';
import { router } from 'expo-router';
import { AddIcon } from '@/components/ui/icon';

function groupByDay(expenses: Expense[]) {
  const groups: { date: string; items: Expense[] }[] = [];
  for (const expense of expenses) {
    const last = groups[groups.length - 1];
    if (last && last.date === expense.occurredAt) last.items.push(expense);
    else groups.push({ date: expense.occurredAt, items: [expense] });
  }
  return groups;
}

export default function ExpensesScreen() {
  const { expenses } = useExpenseData();
  const groups = groupByDay(expenses);

  return (
    <Box className="flex-1 bg-background">
      <Screen contentContainerClassName="px-5 pb-24 pt-2">
        {groups.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            body="Add one with the button below. Categories are managed in Settings."
          />
        ) : (
          groups.map((group) => {
            const dayTotal = group.items.reduce((sum, item) => sum + item.amountMinor, 0);
            return (
              <Box key={group.date} className="mb-6">
                <HStack className="mb-2 items-end justify-between">
                  <Text bold>{formatDayHeading(group.date)}</Text>
                  <Amount minor={dayTotal} size="sm" />
                </HStack>
                <Card className="px-4 py-0">
                  {group.items.map((expense, index) => (
                    <Pressable
                      key={expense.id}
                      onPress={() => router.push(`/expense/${expense.id}`)}
                      className={`flex-row items-center justify-between py-3.5 ${
                        index < group.items.length - 1 ? 'border-b border-border' : ''
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
              </Box>
            );
          })
        )}
      </Screen>
      <Fab size="md" placement="bottom right" onPress={() => router.push('/expense/new')}>
        <FabIcon as={AddIcon} />
        <FabLabel>Add</FabLabel>
      </Fab>
    </Box>
  );
}
