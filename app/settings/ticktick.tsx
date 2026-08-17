import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUiStore } from '@/store/ui';

export default function TickTickSettingsScreen() {
  const status = useUiStore((state) => state.ticktickStatus);

  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>TickTick connection</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            LifeOS will read incomplete tasks and group them by list. Completing a task still happens
            in TickTick.
          </Text>
          <Text size="xs" className="mt-4 font-mono uppercase tracking-widest text-muted-foreground">
            {status}
          </Text>
        </Card>
        <Button isDisabled>
          <ButtonText>Connect TickTick</ButtonText>
        </Button>
        <Text size="sm" className="text-muted-foreground">
          Authentication is not implemented in this phase.
        </Text>
      </VStack>
    </Screen>
  );
}
