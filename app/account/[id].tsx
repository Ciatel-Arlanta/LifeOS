import { EmptyState } from '@/components/empty-state';
import { NotFound } from '@/components/not-found';
import { Screen } from '@/components/screen';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { providerRoles } from '@/features/accounts/helpers';
import { useAccountActions, useAccountData } from '@/features/accounts/store';
import { useSubscriptionData } from '@/features/subscriptions/store';
import { tapLight, tapWarning } from '@/lib/haptics';
import { formatLongDate } from '@/utils/date';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { providers, accounts } = useAccountData();
  const { addServiceLink, removeServiceLink, removeAccount } = useAccountActions();
  const { subscriptions } = useSubscriptionData();
  const account = accounts.find((item) => item.id === Number(id));
  const provider = account ? providers.find((item) => item.id === account.providerId) : undefined;
  const bills = subscriptions.filter((item) => item.accountId === account?.id);
  const [serviceName, setServiceName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!account) {
    return <NotFound title="Account not found" />;
  }

  async function onDelete() {
    if (!account) return;
    await removeAccount(account.id);
    setConfirmDelete(false);
    router.back();
  }

  async function link() {
    if (!serviceName.trim() || !account) return;
    await addServiceLink(account.id, serviceName);
    tapLight();
    setServiceName('');
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: account.providerName }} />
      <Heading size="2xl" className="font-display">
        {account.identifier}
      </Heading>
      <Text size="sm" className="mt-1 text-muted-foreground">
        {account.purpose || 'No purpose set'}
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
          body="Add a service name to remember where this identity is used."
        />
      ) : (
        <Card className="px-4 py-0">
          {account.services.map((service, index) => (
            <HStack
              key={service.id}
              className={`items-center justify-between py-3.5 ${
                index < account.services.length - 1 ? 'border-b border-border' : ''
              }`}>
              <Text bold>{service.name}</Text>
              <Pressable
                onPress={() => removeServiceLink(account.id, service.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Unlink ${service.name}`}>
                <Text size="sm" className="text-destructive">
                  Unlink
                </Text>
              </Pressable>
            </HStack>
          ))}
        </Card>
      )}

      <HStack space="sm" className="mt-3">
        <Input className="flex-1">
          <InputField
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Cursor, Vercel…"
            autoCapitalize="none"
            accessibilityLabel="Service name to link"
            onSubmitEditing={link}
          />
        </Input>
        <Button onPress={link} isDisabled={!serviceName.trim()}>
          <ButtonText>Link</ButtonText>
        </Button>
      </HStack>

      <Text bold className="mb-2 mt-8">
        Subscriptions
      </Text>
      {bills.length === 0 ? (
        <EmptyState title="None linked" body="A subscription can point at this account." />
      ) : (
        <Card className="px-4 py-0">
          {bills.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/subscription/${item.id}`)}
              className={`py-3.5 ${index < bills.length - 1 ? 'border-b border-border' : ''}`}>
              <Text bold>{item.name}</Text>
              <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                {item.serviceName ?? 'No service'} · Renews {item.renewalDate}
              </Text>
            </Pressable>
          ))}
        </Card>
      )}

      <Button
        variant="destructive"
        className="mt-8"
        onPress={() => {
          tapWarning();
          setConfirmDelete(true);
        }}>
        <ButtonText>Delete account</ButtonText>
      </Button>

      <AlertDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Delete this account?</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">
              Linked subscriptions keep working but lose their account. This cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setConfirmDelete(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                void onDelete();
              }}>
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
