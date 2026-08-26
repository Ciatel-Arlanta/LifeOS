import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseActions, useExpenseData } from '@/features/expenses/store';
import { tapLight, tapSuccess, tapWarning } from '@/lib/haptics';
import { useState } from 'react';

export default function CategoriesSettingsScreen() {
  const { categories } = useExpenseData();
  const { addCategory, removeCategory } = useExpenseActions();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const pendingDeleteName = categories.find((item) => item.id === pendingDeleteId)?.name;

  async function add() {
    if (adding) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists.`);
      tapLight();
      return;
    }
    setError(null);
    setAdding(true);
    try {
      await addCategory(trimmed);
      tapSuccess();
      setName('');
    } finally {
      setAdding(false);
    }
  }

  async function onDelete() {
    if (pendingDeleteId == null) return;
    await removeCategory(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <Screen>
      <VStack space="lg">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            body="Add them here as you go. They stay out of the daily expense screen."
          />
        ) : (
          <Card className="px-4 py-0">
            {categories.map((category, index) => (
              <HStack
                key={category.id}
                className={`items-center justify-between py-3.5 ${
                  index < categories.length - 1 ? 'border-b border-border' : ''
                }`}>
                <Text bold>{category.name}</Text>
                <Pressable
                  onPress={() => {
                    tapWarning();
                    setPendingDeleteId(category.id);
                  }}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${category.name}`}>
                  <Text size="sm" className="text-destructive">
                    Remove
                  </Text>
                </Pressable>
              </HStack>
            ))}
          </Card>
        )}

        <VStack space="sm">
          <Text size="sm" bold>
            New category
          </Text>
          <Input isInvalid={Boolean(error)}>
            <InputField
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError(null);
              }}
              placeholder="Food, travel, rent…"
              accessibilityLabel="New category name"
              onSubmitEditing={() => void add()}
            />
          </Input>
          {error ? (
            <Text size="sm" className="text-destructive">
              {error}
            </Text>
          ) : null}
          <Button onPress={() => void add()} isDisabled={!name.trim() || adding}>
            {adding ? <ButtonSpinner /> : null}
            <ButtonText>Add category</ButtonText>
          </Button>
        </VStack>
      </VStack>

      <AlertDialog
        isOpen={pendingDeleteId != null}
        onClose={() => setPendingDeleteId(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Remove {pendingDeleteName ?? 'category'}?</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">
              Expenses in this category become Uncategorized. This cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setPendingDeleteId(null)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                void onDelete();
              }}>
              <ButtonText>Remove</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
