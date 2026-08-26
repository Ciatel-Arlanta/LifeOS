import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SearchIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { identityLabel, membershipLabel } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import type { Identity, Membership } from '@/features/accounts/types';
import { lookupService } from '@/features/accounts/helpers';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';

function MembershipRows({ items }: { items: Membership[] }) {
  return (
    <Card className="px-4 py-0">
      {items.map((membership, index) => (
        <Pressable
          key={membership.id}
          onPress={() => router.push(`/account/${membership.identityId}`)}
          accessibilityRole="button"
          accessibilityLabel={membershipLabel(membership)}
          className={`py-3.5 ${index < items.length - 1 ? 'border-b border-border' : ''}`}>
          <Text bold>{membership.identityIdentifier}</Text>
          <Text size="xs" className="mt-1 font-mono text-muted-foreground">
            {membership.note || `via ${membership.providerName} login`}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

function IdentityRows({ items }: { items: Identity[] }) {
  return (
    <Card className="px-4 py-0">
      {items.map((identity, index) => (
        <Pressable
          key={identity.id}
          onPress={() => router.push(`/account/${identity.id}`)}
          className={`py-3.5 ${index < items.length - 1 ? 'border-b border-border' : ''}`}>
          <Text bold>{identityLabel(identity)}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

export default function ServiceLookupScreen() {
  const { memberships, identities } = useAccountData();
  const [query, setQuery] = useState('');
  const result = useMemo(() => lookupService(query, memberships, identities), [query, memberships, identities]);

  return (
    <Screen>
      <Input>
        <InputSlot>
          <InputIcon as={SearchIcon} className="text-muted-foreground" />
        </InputSlot>
        <InputField
          value={query}
          onChangeText={setQuery}
          placeholder="Cursor, Claude, Vercel…"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Input>

      {!query.trim() ? (
        <Text size="sm" className="mt-6 text-muted-foreground">
          Search a service to see which of your identities hold accounts there.
        </Text>
      ) : !result ? (
        <VStack className="mt-6">
          <EmptyState
            title="No match"
            body="Add a service account on an identity first, then search its name."
          />
        </VStack>
      ) : (
        <VStack space="lg" className="mt-6">
          <Heading size="2xl" className="font-display">
            {result.serviceName}
          </Heading>

          <VStack space="sm">
            <Text bold>Accounts here</Text>
            {result.used.length === 0 ? (
              <EmptyState title="None yet" body="No identity holds an account at this service." />
            ) : (
              <MembershipRows items={result.used} />
            )}
          </VStack>

          <VStack space="sm">
            <Text bold>Not used</Text>
            {result.notUsed.length === 0 ? (
              <EmptyState title="None left" body="Every identity already has an account here." />
            ) : (
              <IdentityRows items={result.notUsed} />
            )}
          </VStack>
        </VStack>
      )}
    </Screen>
  );
}
