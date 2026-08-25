import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ACCOUNT_TYPE_LABEL, ACCOUNT_TYPES } from '@/features/accounts/helpers';
import { useAccountActions, useAccountData } from '@/features/accounts/store';
import type { AccountType } from '@/features/accounts/types';
import { tapLight } from '@/lib/haptics';
import { todayIso } from '@/utils/date';
import { router } from 'expo-router';
import { useState } from 'react';

export default function NewAccountScreen() {
  const { providers } = useAccountData();
  const { addAccount } = useAccountActions();
  const [providerId, setProviderId] = useState<number | null>(null);
  const [providerName, setProviderName] = useState('');
  const [isIdentity, setIsIdentity] = useState(true);
  const [isService, setIsService] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState<AccountType>('personal');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!providerId && !providerName.trim()) {
      setError('Pick or name a provider.');
      return;
    }
    if (!identifier.trim()) {
      setError('Add an email or label.');
      return;
    }
    const created = await addAccount({
      providerId,
      providerName,
      isIdentity,
      isService,
      identifier,
      type,
      purpose,
      createdDate: todayIso(),
    });
    tapLight();
    router.replace(`/account/${created.id}`);
  }

  return (
    <Screen>
      <VStack space="lg">
        <VStack space="sm">
          <Text size="sm" bold>
            Provider
          </Text>
          <HStack space="sm" className="flex-wrap">
            {providers.map((provider) => (
              <Chip
                key={provider.id}
                label={provider.name}
                selected={providerId === provider.id}
                onPress={() => {
                  setProviderId(provider.id);
                  setProviderName(provider.name);
                  setIsIdentity(provider.isIdentity);
                  setIsService(provider.isService);
                }}
              />
            ))}
          </HStack>
          <Input>
            <InputField
              value={providerName}
              onChangeText={(value) => {
                setProviderName(value);
                setProviderId(null);
              }}
              placeholder="Google, Microsoft, GitHub…"
            />
          </Input>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            This provider is
          </Text>
          <HStack space="sm">
            <Chip label="Identity" selected={isIdentity} onPress={() => setIsIdentity((value) => !value)} />
            <Chip label="Service" selected={isService} onPress={() => setIsService((value) => !value)} />
          </HStack>
          <Text size="sm" className="text-muted-foreground">
            Identity is a sign-in (Google). Service is a destination (OpenAI). GitHub can be both.
          </Text>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Identifier
          </Text>
          <Input>
            <InputField
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="personal@gmail.com"
              autoCapitalize="none"
            />
          </Input>
        </VStack>

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

        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}

        <Button onPress={save}>
          <ButtonText>Save account</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
