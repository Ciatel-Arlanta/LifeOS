import { Amount } from '@/components/amount';
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
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ACCOUNT_TYPE_LABEL, membershipsForIdentity } from '@/features/accounts/helpers';
import { useAccountActions, useAccountData } from '@/features/accounts/store';
import { useSubscriptionData } from '@/features/subscriptions/store';
import { tapLight, tapWarning } from '@/lib/haptics';
import { formatLongDate } from '@/utils/date';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function IdentityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { identities, memberships } = useAccountData();
  const { removeMembership, removeIdentity } = useAccountActions();
  const { subscriptions } = useSubscriptionData();
  const identity = identities.find((item) => item.id === Number(id));
  const mine = identity ? membershipsForIdentity(memberships, identity.id) : [];
  const bills = subscriptions.filter(
    (item) => item.membershipId != null && mine.some((membership) => membership.id === item.membershipId)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!identity) {
    return <NotFound title="Identity not found" />;
  }

  async function onDelete() {
    if (!identity) return;
    await removeIdentity(identity.id);
    setConfirmDelete(false);
    router.back();
  }

  async function onRemoveMembership(membershipId: number) {
    await removeMembership(membershipId);
    tapLight();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: identity.providerName }} />
      <Heading size="2xl" className="font-display">
        {identity.identifier}
      </Heading>
      <Text size="sm" className="mt-1 text-muted-foreground">
        {identity.purpose || 'No purpose set'}
      </Text>

      <Card className="mt-6 p-4">
        <VStack space="lg">
          <VStack space="xs">
            <Text size="xs" className="font-mono text-muted-foreground">
              Issued by
            </Text>
            <Text bold>{identity.providerName}</Text>
          </VStack>
          <VStack space="xs">
            <Text size="xs" className="font-mono text-muted-foreground">
              Type
            </Text>
            <Text bold>{ACCOUNT_TYPE_LABEL[identity.type]}</Text>
          </VStack>
          <VStack space="xs">
            <Text size="xs" className="font-mono text-muted-foreground">
              Created
            </Text>
            <Text bold>{formatLongDate(identity.createdDate)}</Text>
          </VStack>
        </VStack>
      </Card>

      <Text bold className="mb-2 mt-8">
        Service accounts
      </Text>
      {mine.length === 0 ? (
        <EmptyState
          title="No service accounts"
          body="Record where this identity is signed in, like Cursor or Claude."
        />
      ) : (
        <Card className="px-4 py-0">
          {mine.map((membership, index) => (
            <HStack
              key={membership.id}
              className={`items-center justify-between py-3.5 ${
                index < mine.length - 1 ? 'border-b border-border' : ''
              }`}>
              <VStack className="flex-1 pr-3">
                <Text bold>{membership.providerName}</Text>
                <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                  {membership.note || `via ${identity.identifier}`}
                </Text>
              </VStack>
              <Pressable
                onPress={() => void onRemoveMembership(membership.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${membership.providerName}`}>
                <Text size="sm" className="text-destructive">
                  Remove
                </Text>
              </Pressable>
            </HStack>
          ))}
        </Card>
      )}

      <Button
        variant="outline"
        className="mt-3"
        onPress={() => router.push(`/account/membership/new?identity=${identity.id}`)}>
        <ButtonText>Add service account</ButtonText>
      </Button>

      <Text bold className="mb-2 mt-8">
        Subscriptions
      </Text>
      {bills.length === 0 ? (
        <EmptyState title="None linked" body="A subscription can point at one of these service accounts." />
      ) : (
        <Card className="px-4 py-0">
          {bills.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/subscription/${item.id}`)}
              className={`py-3.5 ${index < bills.length - 1 ? 'border-b border-border' : ''}`}>
              <HStack className="items-center justify-between">
                <Text bold>{item.name}</Text>
                <Amount minor={item.costMinor} size="sm" />
              </HStack>
              <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                Renews {item.renewalDate}
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
        <ButtonText>Delete identity</ButtonText>
      </Button>

      <AlertDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Delete this identity?</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">
              Its service accounts go too. Linked subscriptions keep working but lose their login. This
              cannot be undone.
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
