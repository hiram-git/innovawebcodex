const API_BASE_URL = 'http://127.0.0.1:18080';
const STORAGE_KEY = 'innova.auth.session';

type StoredSession = {
  token: string;
  tenant?: {
    key?: string;
  };
};

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const session = JSON.parse(raw) as StoredSession;
    const headers: Record<string, string> = {};

    if (session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    if (session.tenant?.key) {
      headers['X-Tenant-Key'] = session.tenant.key;
    }

    return headers;
  } catch {
    return {};
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
