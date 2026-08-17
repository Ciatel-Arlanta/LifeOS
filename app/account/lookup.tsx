import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SearchIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { lookupService } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import type { Account } from '@/features/accounts/types';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';

function AccountRows({ accounts }: { accounts: Account[] }) {
  return (
    <Card className="px-4 py-0">
      {accounts.map((account, index) => (
        <Pressable
          key={account.id}
          onPress={() => router.push(`/account/${account.id}`)}
          className={`py-3.5 ${index < accounts.length - 1 ? 'border-b border-border' : ''}`}>
          <Text bold>{account.providerName}</Text>
          <Text size="xs" className="mt-1 font-mono text-muted-foreground">
            {account.identifier}
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

export default function ServiceLookupScreen() {
  const { providers } = useAccountData();
  const [query, setQuery] = useState('');
  const result = useMemo(() => lookupService(query, providers), [query, providers]);

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
          Search a linked service. Used / not used only includes sign-in identities.
        </Text>
      ) : !result ? (
        <VStack className="mt-6">
          <EmptyState title="No match" body="Link a service on an identity first, then search its name." />
        </VStack>
      ) : (
        <VStack space="lg" className="mt-6">
          <Heading size="2xl" className="font-display">
            {result.serviceName}
          </Heading>

          <VStack space="sm">
            <Text bold>Used</Text>
            {result.used.length === 0 ? (
              <EmptyState title="None yet" body="No sign-in identity is linked to this service." />
            ) : (
              <AccountRows accounts={result.used} />
            )}
          </VStack>

          <VStack space="sm">
            <Text bold>Not used</Text>
            {result.notUsed.length === 0 ? (
              <EmptyState title="None left" body="Every sign-in identity is already linked." />
            ) : (
              <AccountRows accounts={result.notUsed} />
            )}
          </VStack>
        </VStack>
      )}
    </Screen>
  );
}
