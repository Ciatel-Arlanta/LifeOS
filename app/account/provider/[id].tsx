import { Screen } from '@/components/screen';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { ACCOUNT_TYPE_LABEL, getProvider, providerRoles } from '@/features/accounts/mock';
import { router, Stack, useLocalSearchParams } from 'expo-router';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const provider = getProvider(Number(id));

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
    </Screen>
  );
}
