import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function ProtectedRoute() {
  const { session, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return <p className="status-copy">Cargando sesión...</p>;
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
