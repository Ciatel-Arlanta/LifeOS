import { Chip } from '@/components/chip';
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
import { ACCOUNT_TYPE_LABEL, ACCOUNT_TYPES } from '@/features/accounts/helpers';
import { useAccountActions, useAccountData } from '@/features/accounts/store';
import type { AccountType } from '@/features/accounts/types';
import { tapLight, tapSuccess } from '@/lib/haptics';
import { todayIso } from '@/utils/date';
import { router } from 'expo-router';
import { useState } from 'react';

export default function NewIdentityScreen() {
  const { providers } = useAccountData();
  const { addIdentity } = useAccountActions();
  const [providerId, setProviderId] = useState<number | null>(null);
  const [providerName, setProviderName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState<AccountType>('personal');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState<{ provider?: string; identifier?: string }>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    const next: typeof errors = {};
    if (!providerId && !providerName.trim()) next.provider = 'Pick or name an issuer.';
    if (!identifier.trim()) next.identifier = 'Add an email or username.';
    if (next.provider || next.identifier) {
      setErrors(next);
      tapLight();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const created = await addIdentity({
        providerId,
        providerName,
        identifier,
        type,
        purpose,
        createdDate: todayIso(),
      });
      tapSuccess();
      router.replace(`/account/${created.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <VStack space="lg">
        <FormControl isInvalid={Boolean(errors.provider)}>
          <FormControlLabel>
            <FormControlLabelText>Issued by</FormControlLabelText>
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
              placeholder="Google, Microsoft, Proton…"
              accessibilityLabel="Issuer name"
            />
          </Input>
          {errors.provider ? (
            <FormControlError>
              <FormControlErrorText>{errors.provider}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <FormControl isInvalid={Boolean(errors.identifier)}>
          <FormControlLabel>
            <FormControlLabelText>Email or username</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="personal@gmail.com"
              autoCapitalize="none"
              accessibilityLabel="Email or username"
            />
          </Input>
          {errors.identifier ? (
            <FormControlError>
              <FormControlErrorText>{errors.identifier}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <VStack space="sm">
          <Text size="sm" bold>
            Type
          </Text>
          <HStack space="sm" className="flex-wrap">
            {ACCOUNT_TYPES.map((value) => (
              <Chip
                key={value}
                label={ACCOUNT_TYPE_LABEL[value]}
                selected={type === value}
                onPress={() => setType(value)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Purpose
          </Text>
          <Input>
            <InputField value={purpose} onChangeText={setPurpose} placeholder="Everyday logins" />
          </Input>
        </VStack>

        <Button onPress={() => void save()} isDisabled={saving}>
          <ButtonText>{saving ? 'Saving…' : 'Save identity'}</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
