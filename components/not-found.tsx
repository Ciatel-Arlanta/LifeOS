import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { router } from 'expo-router';

/** Shown when a detail route points at a missing record (stale widget link, deleted row). */
export function NotFound({ title }: { title: string }) {
  return (
    <Screen>
      <EmptyState
        title={title}
        body="It may have been deleted, or the link is out of date."
        actionLabel="Go back"
        onAction={() => router.back()}
      />
    </Screen>
  );
}
