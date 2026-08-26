import { Screen } from '@/components/screen';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { syncTickTickTasks } from '@/features/reminders/store';
import { ticktickClient } from '@/integrations/ticktick/client';
import { useUiStore } from '@/store/ui';
import { useState } from 'react';

export default function TickTickSettingsScreen() {
  const status = useUiStore((state) => state.ticktickStatus);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      await ticktickClient.connect(token);
      setToken('');
      await syncTickTickTasks();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not connect.');
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    await ticktickClient.disconnect();
    useUiStore.getState().setTicktickStatus('disconnected');
    setBusy(false);
  }

  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>TickTick connection</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            Paste a TickTick Open API token. LifeOS reads incomplete tasks and groups them by list.
            Completing a task still happens in TickTick.
          </Text>
          <Text size="xs" className="mt-4 font-mono uppercase tracking-widest text-muted-foreground">
            {status}
          </Text>
        </Card>

        {status === 'connected' ? (
          <Button variant="outline" onPress={() => void disconnect()} isDisabled={busy}>
            {busy ? <ButtonSpinner /> : null}
            <ButtonText>Disconnect</ButtonText>
          </Button>
        ) : (
          <>
            <FormControl isInvalid={Boolean(error)}>
              <Input isInvalid={Boolean(error)}>
                <InputField
                  value={token}
                  onChangeText={(value) => {
                    setToken(value);
                    setError(null);
                  }}
                  placeholder="Access token"
                  autoCapitalize="none"
                  secureTextEntry
                  accessibilityLabel="TickTick access token"
                />
              </Input>
              {error ? (
                <FormControlError>
                  <FormControlErrorText>{error}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>
            <Button onPress={() => void connect()} isDisabled={busy || !token.trim()}>
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>Connect TickTick</ButtonText>
            </Button>
          </>
        )}

        {error ? null : (
          <Text size="sm" className="text-muted-foreground">
            Create an app at developer.ticktick.com and use its OAuth access token. The token is stored
            on this device only.
          </Text>
        )}
      </VStack>
    </Screen>
  );
}
