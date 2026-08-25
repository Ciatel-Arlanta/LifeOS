import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseActions, useExpenseData } from '@/features/expenses/store';
import { tapLight, tapWarning } from '@/lib/haptics';
import { useState } from 'react';

export default function CategoriesSettingsScreen() {
  const { categories } = useExpenseData();
  const { addCategory, removeCategory } = useExpenseActions();
  const [name, setName] = useState('');

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addCategory(trimmed);
    tapLight();
    setName('');
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
                    removeCategory(category.id);
                  }}>
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
          <Input>
            <InputField
              value={name}
              onChangeText={setName}
              placeholder="Food, travel, rent…"
              onSubmitEditing={add}
            />
          </Input>
          <Button onPress={add} isDisabled={!name.trim()}>
            <ButtonText>Add category</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </Screen>
  );
}
