import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ACCOUNT_TYPE_LABEL, getAccount, getProvider, providerRoles } from '@/features/accounts/mock';
import { formatLongDate } from '@/utils/date';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const account = getAccount(Number(id));
  const provider = account ? getProvider(account.providerId) : undefined;

  if (!account) {
    return (
      <Screen>
        <Text bold>Account not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: account.providerName }} />
      <Heading size="2xl" className="font-display">
        {account.identifier}
      </Heading>
      <Text size="sm" className="mt-1 text-muted-foreground">
        {ACCOUNT_TYPE_LABEL[account.type]} · {account.purpose}
      </Text>
      {provider ? (
        <HStack space="xs" className="mt-3">
          {providerRoles(provider).map((role) => (
            <Badge key={role} variant="outline">
              <BadgeText>{role}</BadgeText>
            </Badge>
          ))}
        </HStack>
      ) : null}

      <Card className="mt-6 p-4">
        <VStack space="lg">
          <VStack space="xs">
            <Text size="xs" className="font-mono text-muted-foreground">
              Created
            </Text>
            <Text bold>{formatLongDate(account.createdDate)}</Text>
          </VStack>
          <VStack space="xs">
            <Text size="xs" className="font-mono text-muted-foreground">
              Provider
            </Text>
            <Text bold>{account.providerName}</Text>
          </VStack>
        </VStack>
      </Card>

      <Text bold className="mb-2 mt-8">
        Used for
      </Text>
      {account.services.length === 0 ? (
        <EmptyState
          title="No linked services"
          body="Link a service when you remember where this identity is used."
        />
      ) : (
        <Card className="px-4 py-0">
          {account.services.map((service, index) => (
            <Text
              key={service.id}
              bold
              className={`py-3.5 ${
                index < account.services.length - 1 ? 'border-b border-border' : ''
              }`}>
              {service.name}
            </Text>
          ))}
        </Card>
      )}
    </Screen>
  );
}
