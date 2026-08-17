import { ScrollView } from '@/components/ui/scroll-view';
import type { ReactNode } from 'react';
import type { ScrollViewProps } from 'react-native';

export function Screen({
  children,
  contentContainerClassName,
  ...props
}: ScrollViewProps & { children: ReactNode; contentContainerClassName?: string }) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName={contentContainerClassName ?? 'px-5 pb-10 pt-2'}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}>
      {children}
    </ScrollView>
  );
}
