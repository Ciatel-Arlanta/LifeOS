import { getDb } from '@/db/client';
import { accountServices, accounts, providers, services } from '@/db/schema';
import { todayIso } from '@/utils/date';
import { and, eq } from 'drizzle-orm';

import type { Account, AccountDraft, Provider, ServiceRecord } from './types';

export async function listProviders(): Promise<Provider[]> {
  const db = getDb();
  const [providerRows, accountRows, serviceRows, linkRows] = await Promise.all([
    db.select().from(providers),
    db.select().from(accounts),
    db.select().from(services),
    db.select().from(accountServices),
  ]);

  return providerRows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((provider) => ({
      id: provider.id,
      name: provider.name,
      isIdentity: provider.isIdentity,
      isService: provider.isService,
      accounts: accountRows
        .filter((account) => account.providerId === provider.id)
        .map((account) => ({
          id: account.id,
          providerId: account.providerId,
          providerName: provider.name,
          identifier: account.identifier,
          type: account.type,
          purpose: account.purpose ?? '',
          createdDate: account.createdDate ?? todayIso(),
          services: linkRows
            .filter((link) => link.accountId === account.id)
            .map((link) => {
              const service = serviceRows.find((item) => item.id === link.serviceId);
              return service ? { id: service.id, name: service.name } : null;
            })
            .filter((service): service is { id: number; name: string } => Boolean(service)),
        })),
    }));
}

export async function listServices(): Promise<ServiceRecord[]> {
  const rows = await getDb().select().from(services);
  return rows
    .map((row) => ({ id: row.id, name: row.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createAccount(draft: AccountDraft): Promise<Account> {
  const db = getDb();
  const now = new Date();
  let providerId = draft.providerId;
  let providerName = draft.providerName.trim();

  if (!providerId) {
    const [provider] = await db
      .insert(providers)
      .values({
        name: providerName,
        isIdentity: draft.isIdentity,
        isService: draft.isService,
        sortOrder: 0,
        createdAt: now,
      })
      .returning();
    providerId = provider.id;
    providerName = provider.name;
  } else {
    const existing = (await db.select().from(providers).where(eq(providers.id, providerId)))[0];
    if (!existing) throw new Error('Provider not found.');
    providerName = existing.name;
  }

  const [row] = await db
    .insert(accounts)
    .values({
      providerId,
      identifier: draft.identifier.trim(),
      type: draft.type,
      purpose: draft.purpose.trim(),
      createdDate: draft.createdDate || todayIso(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    id: row.id,
    providerId: row.providerId,
    providerName,
    identifier: row.identifier,
    type: row.type,
    purpose: row.purpose ?? '',
    createdDate: row.createdDate ?? todayIso(),
    services: [],
  };
}

export async function updateAccount(
  id: number,
  patch: Pick<AccountDraft, 'identifier' | 'type' | 'purpose'>
): Promise<void> {
  await getDb()
    .update(accounts)
    .set({
      identifier: patch.identifier.trim(),
      type: patch.type,
      purpose: patch.purpose.trim(),
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, id));
}

export async function deleteAccount(id: number): Promise<void> {
  await getDb().delete(accounts).where(eq(accounts.id, id));
}

export async function ensureService(name: string): Promise<ServiceRecord> {
  const trimmed = name.trim();
  const db = getDb();
  const existing = await db.select().from(services);
  const found = existing.find((row) => row.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return { id: found.id, name: found.name };
  const [row] = await db
    .insert(services)
    .values({ name: trimmed, createdAt: new Date() })
    .returning();
  return { id: row.id, name: row.name };
}

export async function linkService(accountId: number, serviceId: number): Promise<void> {
  const db = getDb();
  const existing = await db
    .select()
    .from(accountServices)
    .where(and(eq(accountServices.accountId, accountId), eq(accountServices.serviceId, serviceId)));
  if (existing.length > 0) return;
  await db.insert(accountServices).values({
    accountId,
    serviceId,
    createdAt: new Date(),
  });
}

export async function unlinkService(accountId: number, serviceId: number): Promise<void> {
  await getDb()
    .delete(accountServices)
    .where(and(eq(accountServices.accountId, accountId), eq(accountServices.serviceId, serviceId)));
}
