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

export type ServiceLookupResult = {
  serviceName: string;
  used: Account[];
  notUsed: Account[];
};
