import type { accountTypes } from '@/db/schema';

export type AccountType = (typeof accountTypes)[number];

export type LinkedService = {
  id: number;
  name: string;
};

export type Account = {
  id: number;
  providerId: number;
  providerName: string;
  identifier: string;
  type: AccountType;
  purpose: string;
  createdDate: string;
  services: LinkedService[];
};

export type Provider = {
  id: number;
  name: string;
  isIdentity: boolean;
  isService: boolean;
  accounts: Account[];
};

export type ServiceRecord = {
  id: number;
  name: string;
};

export type ServiceLookupResult = {
  serviceName: string;
  used: Account[];
  notUsed: Account[];
};

export type AccountDraft = {
  providerId: number | null;
  providerName: string;
  isIdentity: boolean;
  isService: boolean;
  identifier: string;
  type: AccountType;
  purpose: string;
  createdDate: string;
};
