import { createWebPersist } from '@/lib/web-persist';
import { todayIso } from '@/utils/date';

import type { Account, AccountDraft, LinkedService, Provider, ServiceRecord } from './types';

type Persist = {
  providers: Omit<Provider, 'accounts'>[];
  accounts: Omit<Account, 'providerName' | 'services'>[];
  services: ServiceRecord[];
  links: { accountId: number; serviceId: number }[];
  nextProviderId: number;
  nextAccountId: number;
  nextServiceId: number;
};

const store = createWebPersist<Persist>('lifeos.account-data', () => ({
  providers: [],
  accounts: [],
  services: [],
  links: [],
  nextProviderId: 1,
  nextAccountId: 1,
  nextServiceId: 1,
}));

function assemble(): { providers: Provider[]; services: ServiceRecord[] } {
  const data = store.read();
  const providers = data.providers
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((provider) => ({
      ...provider,
      accounts: data.accounts
        .filter((account) => account.providerId === provider.id)
        .map((account) => ({
          ...account,
          providerName: provider.name,
          services: data.links
            .filter((link) => link.accountId === account.id)
            .map((link) => data.services.find((service) => service.id === link.serviceId))
            .filter((service): service is LinkedService => Boolean(service)),
        })),
    }));
  return { providers, services: [...data.services].sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function listProviders(): Promise<Provider[]> {
  return assemble().providers;
}

export async function listServices(): Promise<ServiceRecord[]> {
  return assemble().services;
}

export async function createAccount(draft: AccountDraft): Promise<Account> {
  const data = store.read();
  let providerId = draft.providerId;
  if (!providerId) {
    providerId = data.nextProviderId;
    data.providers.push({
      id: providerId,
      name: draft.providerName.trim(),
      isIdentity: draft.isIdentity,
      isService: draft.isService,
    });
    data.nextProviderId += 1;
  }
  const provider = data.providers.find((item) => item.id === providerId);
  if (!provider) throw new Error('Provider not found.');

  const account = {
    id: data.nextAccountId,
    providerId,
    identifier: draft.identifier.trim(),
    type: draft.type,
    purpose: draft.purpose.trim(),
    createdDate: draft.createdDate || todayIso(),
  };
  data.accounts.push(account);
  data.nextAccountId += 1;
  store.write(data);
  return {
    ...account,
    providerName: provider.name,
    services: [],
  };
}

export async function updateAccount(
  id: number,
  patch: Pick<AccountDraft, 'identifier' | 'type' | 'purpose'>
): Promise<void> {
  const data = store.read();
  data.accounts = data.accounts.map((account) =>
    account.id === id
      ? {
          ...account,
          identifier: patch.identifier.trim(),
          type: patch.type,
          purpose: patch.purpose.trim(),
        }
      : account
  );
  store.write(data);
}

export async function deleteAccount(id: number): Promise<void> {
  const data = store.read();
  data.accounts = data.accounts.filter((account) => account.id !== id);
  data.links = data.links.filter((link) => link.accountId !== id);
  store.write(data);
}

export async function ensureService(name: string): Promise<ServiceRecord> {
  const trimmed = name.trim();
  const data = store.read();
  const existing = data.services.find((service) => service.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const service = { id: data.nextServiceId, name: trimmed };
  data.services.push(service);
  data.nextServiceId += 1;
  store.write(data);
  return service;
}

export async function linkService(accountId: number, serviceId: number): Promise<void> {
  const data = store.read();
  if (!data.links.some((link) => link.accountId === accountId && link.serviceId === serviceId)) {
    data.links.push({ accountId, serviceId });
    store.write(data);
  }
}

export async function unlinkService(accountId: number, serviceId: number): Promise<void> {
  const data = store.read();
  data.links = data.links.filter(
    (link) => !(link.accountId === accountId && link.serviceId === serviceId)
  );
  store.write(data);
}
