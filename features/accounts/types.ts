import type { accountTypes } from '@/db/schema';

export type AccountType = (typeof accountTypes)[number];

export type ProviderRef = {
  id: number;
  name: string;
};

export type Identity = {
  id: number;
  providerId: number;
  providerName: string;
  identifier: string;
  type: AccountType;
  purpose: string;
  createdDate: string;
};

export type Membership = {
  id: number;
  providerId: number;
  providerName: string;
  identityId: number;
  identityIdentifier: string;
  note: string;
  createdDate: string;
};

export type ServiceLookupResult = {
  serviceName: string;
  used: Membership[];
  notUsed: Identity[];
};

export type IdentityDraft = {
  providerId: number | null;
  providerName: string;
  identifier: string;
  type: AccountType;
  purpose: string;
  createdDate: string;
};

export type MembershipDraft = {
  providerId: number | null;
  providerName: string;
  identityId: number | null;
  note: string;
  createdDate: string;
};
