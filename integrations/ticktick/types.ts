export type TickTickList = {
  id: string;
  name: string;
};

export type TickTickTask = {
  id: string;
  listId: string;
  listName: string;
  title: string;
  dueAt: string | null;
  isCompleted: false;
};

export type TickTickConnectionState = 'disconnected' | 'connecting' | 'connected';

export type TickTickClient = {
  getConnectionState(): TickTickConnectionState;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  listOpenTasks(): Promise<TickTickTask[]>;
};
