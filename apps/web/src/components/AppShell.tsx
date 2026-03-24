import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { NavMenu } from './NavMenu';
import { useAuthStore } from '../store/auth';
import { apiPost } from '../api/client';
import { PwaStatusCard } from './PwaStatusCard';
import { SyncQueueCard } from './SyncQueueCard';

export function AppShell() {
  const navigate = useNavigate();
  const { session, hydrated, hydrate, clearSession } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logout = async () => {
    if (!session?.token) {
      clearSession();
      navigate('/auth');
      return;
    }

    try {
      await apiPost('/api/v1/auth/logout', {});
    } catch {
      // noop: local cleanup still required for shell transitions
    }

    clearSession();
    navigate('/auth');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Innova Web</h1>
        <p>Shell inicial del frontend moderno.</p>
        <div className="session-summary">
          {hydrated && session ? (
            <>
              <strong>{session.user.displayName}</strong>
              <span>{session.tenant.label}</span>
              <span>{session.user.roles.join(', ')}</span>
              <button type="button" onClick={logout}>Salir</button>
            </>
          ) : (
            <span>Sin sesión activa</span>
          )}
        </div>
        <PwaStatusCard />
        <SyncQueueCard />
        <NavMenu />
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
