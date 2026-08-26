import { BootLoading } from '@/components/boot';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { router } from 'expo-router';
import { membershipsForIdentity } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import type { Identity } from '@/features/accounts/types';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

function IdentityRows({ identities }: { identities: Identity[] }) {
  const { memberships } = useAccountData();
  return (
    <Card className="px-4 py-0">
      {identities.map((identity, index) => {
        const count = membershipsForIdentity(memberships, identity.id).length;
        return (
          <Pressable
            key={identity.id}
            onPress={() => router.push(`/account/${identity.id}`)}
            accessibilityRole="button"
            accessibilityLabel={identity.identifier}
            className={`py-3.5 ${index < identities.length - 1 ? 'border-b border-border' : ''}`}>
            <Text bold>{identity.identifier}</Text>
            <Text size="xs" className="mt-1 font-mono text-muted-foreground">
              {identity.purpose}
              {count > 0 ? ` · ${count} service account${count === 1 ? '' : 's'}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

export default function AccountsScreen() {
  const { ready, providers, identities } = useAccountData();

  if (!ready) return <BootLoading />;

  const grouped = providers
    .map((provider) => ({
      provider,
      items: identities.filter((identity) => identity.providerId === provider.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Box className="flex-1 bg-background">
      <Screen contentContainerClassName="px-5 pb-24 pt-2">
        <Pressable
          onPress={() => router.push('/account/lookup')}
          accessibilityRole="button"
          accessibilityLabel="Look up which identity you used for a service"
          className="mb-8 rounded-xl bg-card px-4 py-4">
          <Text bold>Which identity did I use?</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            Search a service to see every login signed into it.
          </Text>
        </Pressable>

        {identities.length === 0 ? (
          <EmptyState
            title="No identities yet"
            body="Add a sign-in like your Gmail or college Outlook to get started."
          />
        ) : (
          grouped.map(({ provider, items }) => (
            <VStack key={provider.id} space="sm" className="mb-6">
              <Text bold>{provider.name}</Text>
              <IdentityRows identities={items} />
            </VStack>
          ))
        )}
      </Screen>
      <Fab
        size="md"
        placement="bottom right"
        onPress={() => router.push('/account/new')}
        accessibilityRole="button"
        accessibilityLabel="Add identity">
        <FabIcon as={AddIcon} />
        <FabLabel>Add identity</FabLabel>
      </Fab>
    </Box>
  );
}
