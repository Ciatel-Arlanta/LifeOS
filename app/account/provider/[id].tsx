import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_LABEL, providerRoles } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import { router, Stack, useLocalSearchParams } from 'expo-router';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { providers } = useAccountData();
  const provider = providers.find((item) => item.id === Number(id));

  if (!provider) {
    return (
      <Screen>
        <Text bold>Provider not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: provider.name }} />
      <HStack space="xs" className="mb-4">
        {providerRoles(provider).map((role) => (
          <Badge key={role} variant="outline">
            <BadgeText>{role}</BadgeText>
          </Badge>
        ))}
      </HStack>
      <Text size="sm" className="mb-4 text-muted-foreground">
        Identities under {provider.name}
      </Text>
      {provider.accounts.length === 0 ? (
        <EmptyState title="No identities" body="Add one from the Accounts tab." />
      ) : (
        <Card className="px-4 py-0">
          {provider.accounts.map((account, index) => (
            <Pressable
              key={account.id}
              onPress={() => router.push(`/account/${account.id}`)}
              className={`py-3.5 ${
                index < provider.accounts.length - 1 ? 'border-b border-border' : ''
              }`}>
              <Text bold>{account.identifier}</Text>
              <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                {ACCOUNT_TYPE_LABEL[account.type]} · {account.purpose}
              </Text>
            </Pressable>
          ))}
        </Card>
      )}
      <Button className="mt-6" onPress={() => router.push('/account/new')}>
        <ButtonText>Add identity</ButtonText>
      </Button>
    </Screen>
  );
}
