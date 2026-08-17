import type { Account, AccountType, Provider, ServiceLookupResult } from './types';

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  personal: 'Personal',
  college: 'College',
  work: 'Work',
  other: 'Other',
};

export const ACCOUNT_TYPES: AccountType[] = ['personal', 'college', 'work', 'other'];

export function providerRoles(provider: Pick<Provider, 'isIdentity' | 'isService'>): string[] {
  const roles: string[] = [];
  if (provider.isIdentity) roles.push('Identity');
  if (provider.isService) roles.push('Service');
  return roles;
}

export function identityProviders(providers: Provider[]): Provider[] {
  return providers.filter((provider) => provider.isIdentity);
}

export function serviceProviders(providers: Provider[]): Provider[] {
  return providers.filter((provider) => provider.isService);
}

export function allAccounts(providers: Provider[]): Account[] {
  return providers.flatMap((provider) => provider.accounts);
}

export function identityAccounts(providers: Provider[]): Account[] {
  return identityProviders(providers).flatMap((provider) => provider.accounts);
}

export function lookupService(query: string, providers: Provider[]): ServiceLookupResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const serviceNames = [
    ...new Set(
      providers.flatMap((provider) =>
        provider.accounts.flatMap((account) => account.services.map((service) => service.name))
      )
    ),
  ];

  const serviceName =
    serviceNames.find((name) => name.toLowerCase() === trimmed.toLowerCase()) ??
    serviceNames.find((name) => name.toLowerCase().includes(trimmed.toLowerCase()));

  if (!serviceName) return null;

  const candidates = identityAccounts(providers);
  const used = candidates.filter((account) =>
    account.services.some((service) => service.name === serviceName)
  );
  const notUsed = candidates.filter((account) => !used.includes(account));

  return { serviceName, used, notUsed };
}

export function accountLabel(account: Account): string {
  return `${account.providerName} · ${account.identifier}`;
}
