import type { AccountType, Identity, Membership, ServiceLookupResult } from './types';

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  personal: 'Personal',
  college: 'College',
  work: 'Work',
  other: 'Other',
};

export const ACCOUNT_TYPES: AccountType[] = ['personal', 'college', 'work', 'other'];

export function identityLabel(identity: Identity): string {
  return `${identity.providerName} · ${identity.identifier}`;
}

export function membershipLabel(membership: Membership): string {
  return `${membership.providerName} · ${membership.identityIdentifier}`;
}

export function membershipsForIdentity(
  memberships: Membership[],
  identityId: number
): Membership[] {
  return memberships.filter((membership) => membership.identityId === identityId);
}

export function lookupService(
  query: string,
  memberships: Membership[],
  identities: Identity[]
): ServiceLookupResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const serviceNames = [...new Set(memberships.map((membership) => membership.providerName))];

  const serviceName =
    serviceNames.find((name) => name.toLowerCase() === trimmed.toLowerCase()) ??
    serviceNames.find((name) => name.toLowerCase().includes(trimmed.toLowerCase()));

  if (!serviceName) return null;

  const used = memberships.filter((membership) => membership.providerName === serviceName);
  const usedIdentityIds = new Set(used.map((membership) => membership.identityId));
  const notUsed = identities.filter((identity) => !usedIdentityIds.has(identity.id));

  return { serviceName, used, notUsed };
}
