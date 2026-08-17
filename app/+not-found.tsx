import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Missing screen' }} />
      <Screen>
        <Heading size="2xl" className="font-display">
          That screen is not here
        </Heading>
        <Text size="sm" className="mt-2 text-muted-foreground">
          The route does not exist in LifeOS.
        </Text>
        <Link href="/" asChild>
          <Button className="mt-6">
            <ButtonText>Go home</ButtonText>
          </Button>
        </Link>
      </Screen>
    </>
  );
}
