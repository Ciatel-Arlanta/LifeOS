import { ActivityIndicator } from 'react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

/**
 * Full-screen boot states shown before any data is available.
 * Deliberately avoid safe-area hooks: these render outside providers (SSR, early boot).
 */
export function BootLoading({ label = 'Preparing LifeOS…' }: { label?: string }) {
  return (
    <Box className="flex-1 items-center justify-center bg-background px-8" style={{ paddingTop: 48 }}>
      <ActivityIndicator size="small" color="#71717A" />
      <Text size="sm" className="mt-3 text-muted-foreground">
        {label}
      </Text>
    </Box>
  );
}

export function BootError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Box
      className="flex-1 items-center justify-center bg-background px-8"
      style={{ paddingTop: 48 }}>
      <VStack space="sm" className="w-full max-w-sm items-center">
        <Text className="font-sans-semibold text-lg">{title}</Text>
        <Text size="sm" className="text-center text-muted-foreground">
          {message}
        </Text>
        {onRetry ? (
          <Button variant="outline" className="mt-4 self-center" onPress={onRetry}>
            <ButtonText>Try again</ButtonText>
          </Button>
        ) : null}
      </VStack>
    </Box>
  );
}
