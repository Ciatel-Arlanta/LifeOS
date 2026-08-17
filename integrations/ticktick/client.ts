import { AppError } from '@/lib/errors';

import type { TickTickClient } from './types';

/** TickTick lives behind this interface. Phase 5 will implement auth and fetch. */
export const ticktickClient: TickTickClient = {
  getConnectionState: () => 'disconnected',
  connect: async () => {
    throw new AppError('TickTick is not connected yet.', 'ticktick.not_implemented');
  },
  disconnect: async () => undefined,
  listOpenTasks: async () => {
    throw new AppError('TickTick is not connected yet.', 'ticktick.not_implemented');
  },
};
