import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { NotFound } from '@/components/not-found';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { identityLabel } from '@/features/accounts/helpers';
import { useAccountActions, useAccountData } from '@/features/accounts/store';
import { tapLight, tapSuccess } from '@/lib/haptics';
import { todayIso } from '@/utils/date';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function NewMembershipScreen() {
  const params = useLocalSearchParams<{ identity?: string }>();
  const presetIdentityId = params.identity ? Number(params.identity) : null;
  const { providers, identities } = useAccountData();
  const { addMembership } = useAccountActions();
  const [providerId, setProviderId] = useState<number | null>(null);
  const [providerName, setProviderName] = useState('');
  const [identityId, setIdentityId] = useState<number | null>(
    presetIdentityId != null && identities.some((item) => item.id === presetIdentityId)
      ? presetIdentityId
      : null
  );
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ service?: string; identity?: string }>({});
  const [saving, setSaving] = useState(false);

  if (identities.length === 0) {
    return <NotFound title="No identities yet" />;
  }

  async function save() {
    if (saving) return;
    const next: typeof errors = {};
    if (!providerId && !providerName.trim()) next.service = 'Pick or name a service.';
    if (identityId == null) next.identity = 'Pick the sign-in.';
    if (next.service || next.identity) {
      setErrors(next);
      tapLight();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await addMembership({ providerId, providerName, identityId, note, createdDate: todayIso() });
      tapSuccess();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <VStack space="lg">
        <FormControl isInvalid={Boolean(errors.service)}>
          <FormControlLabel>
            <FormControlLabelText>Service</FormControlLabelText>
          </FormControlLabel>
          <HStack space="sm" className="flex-wrap">
            {providers.map((provider) => (
              <Chip
                key={provider.id}
                label={provider.name}
                selected={providerId === provider.id}
                onPress={() => {
                  setProviderId(provider.id);
                  setProviderName(provider.name);
                }}
              />
            ))}
          </HStack>
          <Input className="mt-2">
            <InputField
              value={providerName}
              onChangeText={(value) => {
                setProviderName(value);
                setProviderId(null);
              }}
              placeholder="Cursor, Claude, Vercel…"
              accessibilityLabel="Service name"
            />
          </Input>
          {errors.service ? (
            <FormControlError>
              <FormControlErrorText>{errors.service}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <FormControl isInvalid={Boolean(errors.identity)}>
          <FormControlLabel>
            <FormControlLabelText>Signed in as</FormControlLabelText>
          </FormControlLabel>
          <HStack space="sm" className="flex-wrap">
            {identities.map((identity) => (
              <Chip
                key={identity.id}
                label={identityLabel(identity)}
                selected={identityId === identity.id}
                onPress={() => setIdentityId(identity.id)}
              />
            ))}
          </HStack>
          {errors.identity ? (
            <FormControlError>
              <FormControlErrorText>{errors.identity}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <VStack space="sm">
          <Text size="sm" bold>
            Note
          </Text>
          <Input>
            <InputField value={note} onChangeText={setNote} placeholder="Pro plan, team seat…" />
          </Input>
        </VStack>

        <Button onPress={() => void save()} isDisabled={saving}>
          <ButtonText>{saving ? 'Saving…' : 'Save service account'}</ButtonText>
        </Button>

        <EmptyState
          inline
          title="Multiple accounts welcome"
          body="Add this service again with a different identity for your second account."
        />
      </VStack>
    </Screen>
  );
}
