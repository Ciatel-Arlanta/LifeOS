import { createWebPersist } from '@/lib/web-persist';
import { todayIso } from '@/utils/date';

import type {
  Identity,
  IdentityDraft,
  Membership,
  MembershipDraft,
  ProviderRef,
} from './types';

type IdentityRow = Omit<Identity, 'providerName'>;
type MembershipRow = Omit<Membership, 'providerName' | 'identityIdentifier'>;

type Persist = {
  providers: ProviderRef[];
  identities: IdentityRow[];
  memberships: MembershipRow[];
  nextProviderId: number;
  nextIdentityId: number;
  nextMembershipId: number;
};

const store = createWebPersist<Persist>('lifeos.identity-data', () => ({
  providers: [],
  identities: [],
  memberships: [],
  nextProviderId: 1,
  nextIdentityId: 1,
  nextMembershipId: 1,
}));

function ensureProvider(name: string): ProviderRef {
  const data = store.read();
  const trimmed = name.trim();
  const found = data.providers.find((row) => row.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return found;
  const provider = { id: data.nextProviderId, name: trimmed };
  data.providers.push(provider);
  data.nextProviderId += 1;
  return provider;
}

export async function listProviders(): Promise<ProviderRef[]> {
  return [...store.read().providers].sort((a, b) => a.name.localeCompare(b.name));
}

function withNames(data: Persist): { identities: Identity[]; memberships: Membership[] } {
  return {
    identities: data.identities
      .map((row) => ({
        ...row,
        providerName:
          data.providers.find((item) => item.id === row.providerId)?.name ?? 'Unknown',
      }))
      .sort((a, b) => a.providerName.localeCompare(b.providerName)),
    memberships: data.memberships
      .map((row) => ({
        ...row,
        providerName:
          data.providers.find((item) => item.id === row.providerId)?.name ?? 'Unknown',
        identityIdentifier:
          data.identities.find((item) => item.id === row.identityId)?.identifier ?? 'Unknown',
      }))
      .sort(
        (a, b) =>
          a.providerName.localeCompare(b.providerName) ||
          a.identityIdentifier.localeCompare(b.identityIdentifier)
      ),
  };
}

export async function listIdentities(): Promise<Identity[]> {
  return withNames(store.read()).identities;
}

export async function listMemberships(): Promise<Membership[]> {
  return withNames(store.read()).memberships;
}

export async function createIdentity(draft: IdentityDraft): Promise<Identity> {
  const data = store.read();
  const provider = ensureProvider(draft.providerName || 'Other');
  store.write(data);
  const identityRow: IdentityRow = {
    id: data.nextIdentityId,
    providerId: provider.id,
    identifier: draft.identifier.trim(),
    type: draft.type,
    purpose: draft.purpose.trim(),
    createdDate: draft.createdDate || todayIso(),
  };
  data.identities.push(identityRow);
  data.nextIdentityId += 1;
  store.write(data);
  return { ...identityRow, providerName: provider.name };
}

export async function deleteIdentity(id: number): Promise<void> {
  const data = store.read();
  data.identities = data.identities.filter((identity) => identity.id !== id);
  data.memberships = data.memberships.filter((membership) => membership.identityId !== id);
  store.write(data);
}

export async function createMembership(draft: MembershipDraft): Promise<Membership> {
  if (draft.identityId == null) throw new Error('Pick an identity.');
  const data = store.read();
  const provider = ensureProvider(draft.providerName);
  store.write(data);
  const identity = data.identities.find((item) => item.id === draft.identityId);
  if (!identity) throw new Error('Identity not found.');
  const membership: Membership = {
    id: data.nextMembershipId,
    providerId: provider.id,
    providerName: provider.name,
    identityId: identity.id,
    identityIdentifier: identity.identifier,
    note: draft.note.trim(),
    createdDate: draft.createdDate || todayIso(),
  };
  data.memberships.push({
    id: membership.id,
    providerId: membership.providerId,
    identityId: membership.identityId,
    note: membership.note,
    createdDate: membership.createdDate,
  });
  data.nextMembershipId += 1;
  store.write(data);
  return membership;
}

export async function deleteMembership(id: number): Promise<void> {
  const data = store.read();
  data.memberships = data.memberships.filter((membership) => membership.id !== id);
  store.write(data);
}
