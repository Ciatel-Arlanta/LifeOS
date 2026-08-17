import type { Account, AccountType, Provider, ServiceLookupResult } from './types';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'Google',
    isIdentity: true,
    isService: false,
    accounts: [
      {
        id: 1,
        providerId: 1,
        providerName: 'Google',
        identifier: 'personal@gmail.com',
        type: 'personal',
        purpose: 'Everyday logins',
        createdDate: '2016-04-11',
        services: [
          { id: 1, name: 'ChatGPT' },
          { id: 3, name: 'Netflix' },
          { id: 5, name: 'Spotify' },
          { id: 6, name: 'Notion' },
        ],
      },
      {
        id: 2,
        providerId: 1,
        providerName: 'Google',
        identifier: 'college@gmail.com',
        type: 'college',
        purpose: 'College and student tools',
        createdDate: '2022-08-01',
        services: [
          { id: 2, name: 'Cursor' },
          { id: 7, name: 'Figma' },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Microsoft',
    isIdentity: true,
    isService: false,
    accounts: [
      {
        id: 7,
        providerId: 5,
        providerName: 'Microsoft',
        identifier: 'personal@outlook.com',
        type: 'personal',
        purpose: 'Microsoft 365',
        createdDate: '2019-02-04',
        services: [],
      },
    ],
  },
  {
    id: 4,
    name: 'GitHub',
    isIdentity: true,
    isService: true,
    accounts: [
      {
        id: 5,
        providerId: 4,
        providerName: 'GitHub',
        identifier: 'Personal',
        type: 'personal',
        purpose: 'Own projects',
        createdDate: '2018-01-09',
        services: [{ id: 8, name: 'Vercel' }],
      },
      {
        id: 6,
        providerId: 4,
        providerName: 'GitHub',
        identifier: 'College',
        type: 'college',
        purpose: 'Coursework remotes',
        createdDate: '2022-09-14',
        services: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Anthropic',
    isIdentity: false,
    isService: true,
    accounts: [
      {
        id: 3,
        providerId: 2,
        providerName: 'Anthropic',
        identifier: 'personal',
        type: 'personal',
        purpose: 'Claude Pro',
        createdDate: '2024-11-02',
        services: [{ id: 4, name: 'Claude' }],
      },
    ],
  },
  {
    id: 3,
    name: 'OpenAI',
    isIdentity: false,
    isService: true,
    accounts: [
      {
        id: 4,
        providerId: 3,
        providerName: 'OpenAI',
        identifier: 'personal',
        type: 'personal',
        purpose: 'ChatGPT Plus',
        createdDate: '2023-03-18',
        services: [{ id: 1, name: 'ChatGPT' }],
      },
    ],
  },
];

export const MOCK_SERVICE_NAMES = [
  'ChatGPT',
  'Claude',
  'Cursor',
  'Figma',
  'Netflix',
  'Notion',
  'Spotify',
  'Vercel',
];

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  personal: 'Personal',
  college: 'College',
  work: 'Work',
  other: 'Other',
};

export function providerRoles(provider: Pick<Provider, 'isIdentity' | 'isService'>): string[] {
  const roles: string[] = [];
  if (provider.isIdentity) roles.push('Identity');
  if (provider.isService) roles.push('Service');
  return roles;
}

export function identityProviders(): Provider[] {
  return MOCK_PROVIDERS.filter((provider) => provider.isIdentity);
}

export function serviceProviders(): Provider[] {
  return MOCK_PROVIDERS.filter((provider) => provider.isService);
}

export function allAccounts(): Account[] {
  return MOCK_PROVIDERS.flatMap((provider) => provider.accounts);
}

export function identityAccounts(): Account[] {
  return identityProviders().flatMap((provider) => provider.accounts);
}

export function getProvider(id: number): Provider | undefined {
  return MOCK_PROVIDERS.find((provider) => provider.id === id);
}

export function getAccount(id: number): Account | undefined {
  return allAccounts().find((account) => account.id === id);
}

export function lookupService(query: string): ServiceLookupResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const serviceName =
    MOCK_SERVICE_NAMES.find((name) => name.toLowerCase() === trimmed.toLowerCase()) ??
    MOCK_SERVICE_NAMES.find((name) => name.toLowerCase().includes(trimmed.toLowerCase()));

  if (!serviceName) return null;

  const candidates = identityAccounts();
  const used = candidates.filter((account) =>
    account.services.some((service) => service.name === serviceName)
  );
  const notUsed = candidates.filter((account) => !used.includes(account));

  return { serviceName, used, notUsed };
}
