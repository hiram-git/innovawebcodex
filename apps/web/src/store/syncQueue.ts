import { create } from 'zustand';

export type SyncQueueItem = {
  id: string;
  entity: 'payment' | 'invoice';
  endpoint: string;
  method: 'POST';
  payload: Record<string, unknown>;
  status: 'pending' | 'failed';
  createdAt: string;
};

type SyncQueueState = {
  items: SyncQueueItem[];
  hydrated: boolean;
  hydrate: () => void;
  enqueue: (item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt'>) => SyncQueueItem;
  flush: (processor: (item: SyncQueueItem) => Promise<void>) => Promise<{ synced: number; failed: number }>;
  clear: () => void;
};

const STORAGE_KEY = 'innova.sync.queue';

const persist = (items: SyncQueueItem[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const useSyncQueueStore = create<SyncQueueState>((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ items: [], hydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SyncQueueItem[];
      set({ items: parsed, hydrated: true });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      set({ items: [], hydrated: true });
    }
  },
  enqueue: (item) => {
    const queued: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const items = [queued, ...get().items];
    persist(items);
    set({ items, hydrated: true });
    return queued;
  },
  flush: async (processor) => {
    const sourceItems = get().items;
    const nextItems: SyncQueueItem[] = [];
    let synced = 0;
    let failed = 0;

    for (const item of sourceItems) {
      try {
        await processor(item);
        synced += 1;
      } catch {
        failed += 1;
        nextItems.push({ ...item, status: 'failed' });
      }
    }

    persist(nextItems);
    set({ items: nextItems, hydrated: true });

    return { synced, failed };
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ items: [], hydrated: true });
  },
}));
