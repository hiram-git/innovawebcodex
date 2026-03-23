import { create } from 'zustand';

export type SessionRecord = {
  id: string;
  token: string;
  status: string;
  user: {
    email: string;
    displayName: string;
    roles: string[];
  };
  tenant: {
    key: string;
    label: string;
  };
  permissions: string[];
  issuedAt: string;
  expiresAt: string;
};

type AuthState = {
  session: SessionRecord | null;
  hydrated: boolean;
  setSession: (session: SessionRecord | null) => void;
  clearSession: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = 'innova.auth.session';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  setSession: (session) => {
    if (typeof window !== 'undefined') {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({ session, hydrated: true });
  },
  clearSession: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    set({ session: null, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ session: null, hydrated: true });
      return;
    }

    try {
      set({ session: JSON.parse(raw) as SessionRecord, hydrated: true });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      set({ session: null, hydrated: true });
    }
  },
}));
