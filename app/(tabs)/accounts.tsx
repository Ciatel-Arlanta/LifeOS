import { Screen } from '@/components/screen';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { identityProviders, providerRoles, serviceProviders } from '@/features/accounts/mock';
import type { Provider } from '@/features/accounts/types';
import { router } from 'expo-router';

function ProviderBlock({ provider }: { provider: Provider }) {
  return (
    <VStack space="sm" className="mb-6">
      <Pressable onPress={() => router.push(`/account/provider/${provider.id}`)}>
        <HStack className="items-center justify-between">
          <Text bold>{provider.name}</Text>
          <HStack space="xs">
            {providerRoles(provider).map((role) => (
              <Badge key={role} variant="outline">
                <BadgeText>{role}</BadgeText>
              </Badge>
            ))}
          </HStack>
        </HStack>
      </Pressable>
      <Card className="px-4 py-0">
        {provider.accounts.map((account, index) => (
          <Pressable
            key={account.id}
            onPress={() => router.push(`/account/${account.id}`)}
            className={`py-3.5 ${index < provider.accounts.length - 1 ? 'border-b border-border' : ''}`}>
            <Text bold>{account.identifier}</Text>
            <Text size="xs" className="mt-1 font-mono text-muted-foreground">
              {account.purpose}
              {account.services.length > 0
                ? ` · ${account.services.length} service${account.services.length === 1 ? '' : 's'}`
                : ''}
            </Text>
          </Pressable>
        ))}
      </Card>
    </VStack>
  );
}

export default function AccountsScreen() {
  return (
    <Screen>
      <Pressable
        onPress={() => router.push('/account/lookup')}
        className="mb-8 rounded-xl bg-card px-4 py-4">
        <Text bold>Which account did I use?</Text>
        <Text size="sm" className="mt-1 text-muted-foreground">
          Search a service. Only sign-in identities such as Google, Microsoft, and GitHub are listed.
        </Text>
      </Pressable>

      <Text bold className="mb-3">
        Sign-in identities
      </Text>
      {identityProviders().map((provider) => (
        <ProviderBlock key={`identity-${provider.id}`} provider={provider} />
      ))}

      <Text bold className="mb-3">
        Services
      </Text>
      {serviceProviders().map((provider) => (
        <ProviderBlock key={`service-${provider.id}`} provider={provider} />
      ))}
    </Screen>
  );
}
