import { Screen } from '@/components/screen';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { hydrateApp } from '@/features/app/hydrate';
import {
  backupFileName,
  countBackup,
  describeCounts,
  expensesToCsv,
  parseBackup,
} from '@/features/backup/helpers';
import { collectBackup, restoreBackup } from '@/features/backup/repository';
import type { Backup } from '@/features/backup/types';
import { pickTextFile, saveTextFile } from '@/lib/files';
import { tapLight, tapSuccess, tapWarning } from '@/lib/haptics';
import { useState } from 'react';

type Busy = 'json' | 'csv' | 'pick' | 'restore' | null;

export default function BackupSettingsScreen() {
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Backup | null>(null);

  async function run(kind: Exclude<Busy, null>, action: () => Promise<string | null>) {
    if (busy) return;
    setBusy(kind);
    setStatus(null);
    setError(null);
    try {
      const message = await action();
      if (message) setStatus(message);
    } catch (caught) {
      tapWarning();
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  }

  function exportJson() {
    tapLight();
    void run('json', async () => {
      const backup = await collectBackup();
      const saved = await saveTextFile(
        backupFileName('json'),
        'application/json',
        JSON.stringify(backup, null, 2)
      );
      if (!saved) return null;
      tapSuccess();
      return `Exported ${describeCounts(countBackup(backup))}.`;
    });
  }

  function exportCsv() {
    tapLight();
    void run('csv', async () => {
      const backup = await collectBackup();
      const saved = await saveTextFile(backupFileName('csv'), 'text/csv', expensesToCsv(backup));
      if (!saved) return null;
      tapSuccess();
      return `Exported ${backup.expenses.length} expenses as CSV.`;
    });
  }

  function chooseImport() {
    tapLight();
    void run('pick', async () => {
      const text = await pickTextFile('application/json');
      if (text == null) return null;
      setPending(parseBackup(text));
      return null;
    });
  }

  function confirmImport() {
    const backup = pending;
    if (!backup) return;
    setPending(null);
    void run('restore', async () => {
      await restoreBackup(backup);
      await hydrateApp();
      tapSuccess();
      return `Restored ${describeCounts(countBackup(backup))}.`;
    });
  }

  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>What is included</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            Expenses, subscriptions, categories, and accounts, with the links between
            them. TickTick tasks and reminder schedules are not — those come back when
            TickTick syncs.
          </Text>
        </Card>

        <VStack space="sm">
          <Text bold>Export</Text>
          <Button onPress={exportJson} isDisabled={busy !== null}>
            {busy === 'json' ? <ButtonSpinner /> : null}
            <ButtonText>Export backup (JSON)</ButtonText>
          </Button>
          <Button variant="outline" onPress={exportCsv} isDisabled={busy !== null}>
            {busy === 'csv' ? <ButtonSpinner /> : null}
            <ButtonText>Export expenses (CSV)</ButtonText>
          </Button>
          <Text size="xs" className="text-muted-foreground">
            CSV is for spreadsheets only. Restoring needs the JSON file.
          </Text>
        </VStack>

        <VStack space="sm">
          <Text bold>Import</Text>
          <Button variant="outline" onPress={chooseImport} isDisabled={busy !== null}>
            {busy === 'pick' || busy === 'restore' ? <ButtonSpinner /> : null}
            <ButtonText>Restore from a backup file</ButtonText>
          </Button>
          <Text size="xs" className="text-muted-foreground">
            A restore replaces everything currently in the app.
          </Text>
        </VStack>

        {status ? (
          <Text size="sm" className="text-muted-foreground">
            {status}
          </Text>
        ) : null}
        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}
      </VStack>

      <AlertDialog isOpen={pending !== null} onClose={() => setPending(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Replace all data?</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">
              {pending
                ? `This backup holds ${describeCounts(countBackup(pending))}. Everything in LifeOS now is deleted first. This cannot be undone.`
                : ''}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setPending(null)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button variant="destructive" onPress={confirmImport}>
              <ButtonText>Replace</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
