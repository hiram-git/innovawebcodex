import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

type SessionRecord = {
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

type SessionResponse = {
  data: SessionRecord;
};

export function AuthPage() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Listo para iniciar sesión.');

  const loadSession = async (sessionToken: string) => {
    const response = await fetch(`http://127.0.0.1:18080/api/v1/auth/session?token=${encodeURIComponent(sessionToken)}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = (await response.json()) as SessionResponse;
    setSession(data.data);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadSession(token).catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : 'No fue posible consultar la sesión.');
    });
  }, [token]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Iniciando sesión...');
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
      tenant: String(formData.get('tenant') || 'default'),
    };

    try {
      const response = await apiPost<SessionResponse>('/api/v1/auth/login', payload);
      setToken(response.data.token);
      setSession(response.data);
      setStatus('Sesión iniciada en backoffice scaffold.');
      event.currentTarget.reset();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    }
  };

  const logout = async () => {
    if (!token) {
      setStatus('No hay token cargado para cerrar sesión.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:18080/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      setSession(null);
      setToken('');
      setStatus('Sesión cerrada.');
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible cerrar sesión.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 11</span>
        <h2>Auth / Backoffice Foundation</h2>
        <p>Scaffold inicial de login, sesión, tenant y permisos para el nuevo backoffice.</p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={login}>
          <input name="email" placeholder="admin@innova.local" required />
          <input name="password" placeholder="Password" type="password" required />
          <input name="tenant" placeholder="Tenant" defaultValue="default" required />
          <button type="submit">Iniciar sesión</button>
        </form>
      </div>

      <p className="status-copy">{status}</p>

      <div className="table-card">
        <div className="auth-actions">
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </div>
        {session ? (
          <div className="session-grid">
            <div className="card">
              <h3>Usuario</h3>
              <p>{session.user.displayName}</p>
              <p>{session.user.email}</p>
              <p>Roles: {session.user.roles.join(', ')}</p>
            </div>
            <div className="card">
              <h3>Tenant</h3>
              <p>{session.tenant.label}</p>
              <p>Key: {session.tenant.key}</p>
              <p>Expira: {session.expiresAt}</p>
            </div>
            <div className="card">
              <h3>Permisos</h3>
              <ul className="status-list">
                {session.permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Token</h3>
              <p className="token-copy">{session.token}</p>
              <p>Estado: {session.status}</p>
            </div>
          </div>
        ) : (
          <p>No hay sesión activa todavía.</p>
        )}
      </div>
    </section>
  );
}
