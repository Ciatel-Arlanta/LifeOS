import { getDb } from '@/db/client';
import { identities, memberships, providers } from '@/db/schema';
import { todayIso } from '@/utils/date';
import { eq } from 'drizzle-orm';

import type {
  Identity,
  IdentityDraft,
  Membership,
  MembershipDraft,
  ProviderRef,
} from './types';

async function ensureProvider(db: ReturnType<typeof getDb>, name: string): Promise<ProviderRef> {
  const trimmed = name.trim();
  const existing = await db.select().from(providers);
  const found = existing.find((row) => row.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return { id: found.id, name: found.name };
  const [row] = await db.insert(providers).values({ name: trimmed, createdAt: new Date() }).returning();
  return { id: row.id, name: row.name };
}

export async function listProviders(): Promise<ProviderRef[]> {
  const rows = await getDb().select().from(providers);
  return rows.map((row) => ({ id: row.id, name: row.name })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listIdentities(): Promise<Identity[]> {
  const [identityRows, providerRows] = await Promise.all([
    getDb().select().from(identities),
    getDb().select().from(providers),
  ]);
  return identityRows
    .map((row) => ({
      id: row.id,
      providerId: row.providerId,
      providerName: providerRows.find((item) => item.id === row.providerId)?.name ?? 'Unknown',
      identifier: row.identifier,
      type: row.type,
      purpose: row.purpose ?? '',
      createdDate: row.createdDate ?? todayIso(),
    }))
    .sort((a, b) => a.providerName.localeCompare(b.providerName));
}

export async function listMemberships(): Promise<Membership[]> {
  const db = getDb();
  const [membershipRows, identityRows, providerRows] = await Promise.all([
    db.select().from(memberships),
    db.select().from(identities),
    db.select().from(providers),
  ]);
  return membershipRows
    .map((row) => ({
      id: row.id,
      providerId: row.providerId,
      providerName: providerRows.find((item) => item.id === row.providerId)?.name ?? 'Unknown',
      identityId: row.identityId,
      identityIdentifier:
        identityRows.find((item) => item.id === row.identityId)?.identifier ?? 'Unknown',
      note: row.note ?? '',
      createdDate: row.createdDate ?? todayIso(),
    }))
    .sort(
      (a, b) =>
        a.providerName.localeCompare(b.providerName) ||
        a.identityIdentifier.localeCompare(b.identityIdentifier)
    );
}

export async function createIdentity(draft: IdentityDraft): Promise<Identity> {
  const db = getDb();
  const now = new Date();
  const provider = await ensureProvider(db, draft.providerName || 'Other');
  const [row] = await db
    .insert(identities)
    .values({
      providerId: provider.id,
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
    providerId: provider.id,
    providerName: provider.name,
    identifier: row.identifier,
    type: row.type,
    purpose: row.purpose ?? '',
    createdDate: row.createdDate ?? todayIso(),
  };
}

export async function deleteIdentity(id: number): Promise<void> {
  await getDb().delete(identities).where(eq(identities.id, id));
}

export async function createMembership(draft: MembershipDraft): Promise<Membership> {
  if (draft.identityId == null) throw new Error('Pick an identity.');
  const db = getDb();
  const now = new Date();
  const provider = await ensureProvider(db, draft.providerName);
  const [row] = await db
    .insert(memberships)
    .values({
      providerId: provider.id,
      identityId: draft.identityId,
      note: draft.note.trim(),
      createdDate: draft.createdDate || todayIso(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const identifier =
    (await db.select().from(identities).where(eq(identities.id, row.identityId)))[0]?.identifier ??
    'Unknown';

  return {
    id: row.id,
    providerId: provider.id,
    providerName: provider.name,
    identityId: row.identityId,
    identityIdentifier: identifier,
    note: row.note ?? '',
    createdDate: row.createdDate ?? todayIso(),
  };
}

export async function deleteMembership(id: number): Promise<void> {
  await getDb().delete(memberships).where(eq(memberships.id, id));
}
