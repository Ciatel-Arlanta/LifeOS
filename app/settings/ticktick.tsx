import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
          <Button variant="outline" onPress={disconnect} isDisabled={busy}>
            <ButtonText>Disconnect</ButtonText>
          </Button>
        ) : (
          <>
            <Input>
              <InputField
                value={token}
                onChangeText={setToken}
                placeholder="Access token"
                autoCapitalize="none"
                secureTextEntry
              />
            </Input>
            <Button onPress={connect} isDisabled={busy || !token.trim()}>
              <ButtonText>Connect TickTick</ButtonText>
            </Button>
          </>
        )}

        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : (
          <Text size="sm" className="text-muted-foreground">
            Create an app at developer.ticktick.com and use its OAuth access token. The token is stored
            on this device only.
          </Text>
        )}
      </VStack>
    </Screen>
  );
}
