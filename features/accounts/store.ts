import { useCallback, useSyncExternalStore } from 'react';

import { lookupService, membershipLabel } from './helpers';
import * as repository from './repository';
import type { IdentityDraft, MembershipDraft } from './types';

type SnapshotIdentity = Awaited<ReturnType<typeof repository.listIdentities>>[number];
type SnapshotMembership = Awaited<ReturnType<typeof repository.listMemberships>>[number];

type Snapshot = {
  ready: boolean;
  providers: Awaited<ReturnType<typeof repository.listProviders>>;
  identities: SnapshotIdentity[];
  memberships: SnapshotMembership[];
};

let snapshot: Snapshot = { ready: false, providers: [], identities: [], memberships: [] };
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
  const [providers, identities, memberships] = await Promise.all([
    repository.listProviders(),
    repository.listIdentities(),
    repository.listMemberships(),
  ]);
  snapshot = { ready: true, providers, identities, memberships };
  emit();
}

export function useAccountData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useAccountActions() {
  const addIdentity = useCallback(async (draft: IdentityDraft) => {
    const created = await repository.createIdentity(draft);
    await hydrateAccounts();
    return created;
  }, []);

  const removeIdentity = useCallback(async (id: number) => {
    await repository.deleteIdentity(id);
    await hydrateAccounts();
  }, []);

  const addMembership = useCallback(async (draft: MembershipDraft) => {
    const created = await repository.createMembership(draft);
    await hydrateAccounts();
    return created;
  }, []);

  const removeMembership = useCallback(async (id: number) => {
    await repository.deleteMembership(id);
    await hydrateAccounts();
  }, []);

  return { addIdentity, removeIdentity, addMembership, removeMembership };
}

export function findIdentity(id: number): SnapshotIdentity | undefined {
  return snapshot.identities.find((identity) => identity.id === id);
}

export function searchService(query: string) {
  return lookupService(query, snapshot.memberships, snapshot.identities);
}

export function membershipLabelById(id: number | null): string | null {
  if (id == null) return null;
  const membership = snapshot.memberships.find((item) => item.id === id);
  return membership ? membershipLabel(membership) : null;
}

export { membershipLabel };
