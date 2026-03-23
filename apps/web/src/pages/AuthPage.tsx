import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api/client';
import { SessionRecord, useAuthStore } from '../store/auth';

type SessionResponse = {
  data: SessionRecord;
};

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSession, clearSession, hydrate } = useAuthStore();
  const [status, setStatus] = useState('Listo para iniciar sesión.');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (session) {
      const state = location.state as { from?: string } | null;
      const nextPath = state?.from && state.from !== '/auth' ? state.from : '/';
      navigate(nextPath, { replace: true });
    }
  }, [location.state, navigate, session]);

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
      setSession(response.data);
      setStatus('Sesión iniciada en backoffice scaffold.');
      event.currentTarget.reset();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    }
  };

  const refreshSession = async () => {
    if (!session?.token) {
      setStatus('No hay sesión guardada para consultar.');
      return;
    }

    try {
      const response = await apiGet<SessionResponse>(`/api/v1/auth/session?token=${encodeURIComponent(session.token)}`);
      setSession(response.data);
      setStatus('Sesión refrescada desde API.');
    } catch (error: unknown) {
      clearSession();
      setStatus(error instanceof Error ? error.message : 'No fue posible consultar la sesión.');
    }
  };

  const logout = async () => {
    if (!session?.token) {
      setStatus('No hay token cargado para cerrar sesión.');
      return;
    }

    try {
      await apiPost('/api/v1/auth/logout', {});
      clearSession();
      setStatus('Sesión cerrada.');
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible cerrar sesión.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 12</span>
        <h2>Frontend Shell / Auth</h2>
        <p>Shell frontend con estado global de sesión, guards de navegación y tenant propagado al cliente HTTP.</p>
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
          <button type="button" onClick={refreshSession}>Refrescar sesión</button>
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
