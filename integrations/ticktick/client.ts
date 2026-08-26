import { AppError } from '@/lib/errors';

import { getTickTickToken, setTickTickToken } from './token';
import type { TickTickClient, TickTickConnectionState, TickTickTask } from './types';

const BASE = 'https://api.ticktick.com/open/v1';

type Project = { id: string; name: string };
type ApiTask = {
  id: string;
  projectId?: string;
  title: string;
  status?: number;
  dueDate?: string;
};

async function request<T>(path: string, token: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AppError('Could not reach TickTick. Check your connection.', 'ticktick.network');
  }
  if (response.status === 401 || response.status === 403) {
    throw new AppError(
      'TickTick rejected this token. Paste a fresh one in Settings.',
      'ticktick.unauthorized'
    );
  }
  if (!response.ok) {
    if (response.status >= 500) {
      throw new AppError('TickTick is having trouble right now. Try again later.', 'ticktick.request_failed');
    }
    throw new AppError(`TickTick request failed (${response.status}).`, 'ticktick.request_failed');
  }
  return (await response.json()) as T;
}

export const ticktickClient: TickTickClient = {
  getConnectionState(): TickTickConnectionState {
    return 'disconnected';
  },

  async connect(token?: string) {
    const value = token?.trim();
    if (!value) throw new AppError('Paste a TickTick API token.', 'ticktick.missing_token');
    await request<Project[]>('/project', value);
    await setTickTickToken(value);
  },

  async disconnect() {
    await setTickTickToken(null);
  },

  async listOpenTasks(): Promise<TickTickTask[]> {
    const token = await getTickTickToken();
    if (!token) throw new AppError('TickTick is not connected.', 'ticktick.disconnected');

    const projects = await request<Project[]>('/project', token);
    const open: TickTickTask[] = [];

    for (const project of projects) {
      const data = await request<{ tasks?: ApiTask[] }>(`/project/${project.id}/data`, token);
      for (const task of data.tasks ?? []) {
        if (task.status === 2) continue;
        open.push({
          id: task.id,
          listId: project.id,
          listName: project.name,
          title: task.title,
          dueAt: task.dueDate ?? null,
          isCompleted: false,
        });
      }
    }

    return open;
  },
};

export async function hasTickTickToken(): Promise<boolean> {
  return Boolean(await getTickTickToken());
}
