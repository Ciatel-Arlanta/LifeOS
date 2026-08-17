import { create } from 'zustand';

type TickTickStatus = 'disconnected' | 'connecting' | 'connected';

type UiState = {
  ticktickStatus: TickTickStatus;
  setTicktickStatus: (status: TickTickStatus) => void;
};

/** Client-only UI state. Persistent records live in SQLite, not here. */
export const useUiStore = create<UiState>((set) => ({
  ticktickStatus: 'disconnected',
  setTicktickStatus: (ticktickStatus) => set({ ticktickStatus }),
}));
