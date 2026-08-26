import { BootLoading } from '@/components/boot';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { providerRoles } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import type { Provider } from '@/features/accounts/types';
import { router } from 'expo-router';

function ProviderBlock({ provider }: { provider: Provider }) {
  return (
    <VStack space="sm" className="mb-6">
      <Pressable
        onPress={() => router.push(`/account/provider/${provider.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${provider.name} details`}
        hitSlop={8}>
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
        {provider.accounts.length === 0 ? (
          <Text size="sm" className="py-3.5 text-muted-foreground">
            No identities yet
          </Text>
        ) : (
          provider.accounts.map((account, index) => (
            <Pressable
              key={account.id}
              onPress={() => router.push(`/account/${account.id}`)}
              accessibilityRole="button"
              accessibilityLabel={account.identifier}
              className={`py-3.5 ${index < provider.accounts.length - 1 ? 'border-b border-border' : ''}`}>
              <Text bold>{account.identifier}</Text>
              <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                {account.purpose}
                {account.services.length > 0
                  ? ` · ${account.services.length} service${account.services.length === 1 ? '' : 's'}`
                  : ''}
              </Text>
            </Pressable>
          ))
        )}
      </Card>
    </VStack>
  );
}

export default function AccountsScreen() {
  const { identityProviders, serviceProviders, providers, ready } = useAccountData();

  if (!ready) return <BootLoading />;

  return (
    <Box className="flex-1 bg-background">
      <Screen contentContainerClassName="px-5 pb-24 pt-2">
        <Pressable
          onPress={() => router.push('/account/lookup')}
          accessibilityRole="button"
          accessibilityLabel="Look up which account you used for a service"
          className="mb-8 rounded-xl bg-card px-4 py-4">
          <Text bold>Which account did I use?</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            Search a service. Only sign-in identities such as Google, Microsoft, and GitHub are listed.
          </Text>
        </Pressable>

        {providers.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            body="Add a sign-in identity or a service account. Subscriptions can link to these later."
          />
        ) : (
          <>
            {identityProviders.length > 0 ? (
              <>
                <Text bold className="mb-3">
                  Sign-in identities
                </Text>
                {identityProviders.map((provider) => (
                  <ProviderBlock key={`identity-${provider.id}`} provider={provider} />
                ))}
              </>
            ) : null}

            {serviceProviders.length > 0 ? (
              <>
                <Text bold className="mb-3">
                  Services
                </Text>
                {serviceProviders.map((provider) => (
                  <ProviderBlock key={`service-${provider.id}`} provider={provider} />
                ))}
              </>
            ) : null}
          </>
        )}
      </Screen>
      <Fab
        size="md"
        placement="bottom right"
        accessibilityLabel="Add account"
        onPress={() => router.push('/account/new')}>
        <FabIcon as={AddIcon} />
        <FabLabel>Add</FabLabel>
      </Fab>
    </Box>
  );
}
