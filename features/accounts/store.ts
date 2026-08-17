import { useCallback, useSyncExternalStore } from 'react';

import {
  allAccounts,
  identityProviders,
  lookupService,
  serviceProviders,
} from './helpers';
import * as repository from './repository';
import type { Account, AccountDraft, Provider, ServiceRecord } from './types';

type Snapshot = {
  ready: boolean;
  providers: Provider[];
  services: ServiceRecord[];
};

let snapshot: Snapshot = { ready: false, providers: [], services: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export async function hydrateAccounts() {
  const [providers, services] = await Promise.all([
    repository.listProviders(),
    repository.listServices(),
  ]);
  snapshot = { ready: true, providers, services };
  emit();
}

export function getAccountSnapshot() {
  return snapshot;
}

export function useAccountData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...data,
    accounts: allAccounts(data.providers),
    identityProviders: identityProviders(data.providers),
    serviceProviders: serviceProviders(data.providers),
  };
}

export function useAccountActions() {
  const addAccount = useCallback(async (draft: AccountDraft) => {
    const created = await repository.createAccount(draft);
    await hydrateAccounts();
    return created;
  }, []);

  const editAccount = useCallback(
    async (id: number, patch: Pick<AccountDraft, 'identifier' | 'type' | 'purpose'>) => {
      await repository.updateAccount(id, patch);
      await hydrateAccounts();
    },
    []
  );

  const removeAccount = useCallback(async (id: number) => {
    await repository.deleteAccount(id);
    await hydrateAccounts();
  }, []);

  const addServiceLink = useCallback(async (accountId: number, serviceName: string) => {
    const service = await repository.ensureService(serviceName);
    await repository.linkService(accountId, service.id);
    await hydrateAccounts();
    return service;
  }, []);

  const removeServiceLink = useCallback(async (accountId: number, serviceId: number) => {
    await repository.unlinkService(accountId, serviceId);
    await hydrateAccounts();
  }, []);

  return { addAccount, editAccount, removeAccount, addServiceLink, removeServiceLink };
}

export function findAccount(id: number): Account | undefined {
  return allAccounts(snapshot.providers).find((account) => account.id === id);
}

export { accountLabel } from './helpers';

export function findProvider(id: number): Provider | undefined {
  return snapshot.providers.find((provider) => provider.id === id);
}

export function searchService(query: string) {
  return lookupService(query, snapshot.providers);
}

export { ensureService, linkService } from './repository';
