import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api/client';

type HealthResponse = {
  status: string;
  service: string;
  time: string;
  database: {
    driver: string;
    host: string;
    database: string;
  };
};

type MetaResponse = {
  currentSprint: string;
  status: string;
  completed: string[];
  next: string[];
};

const checkpoints = [
  'Laragon 6.0 + SQL Server',
  'Laravel API-first',
  'React + Vite + TypeScript',
  'PWA mobile-first',
  'Offline cache controlado',
];

const offlineScope = [
  'Assets estáticos del shell y navegación ya visitada',
  'Catálogos y consultas GET permitidas con expiración corta',
  'Pantalla offline para degradación controlada',
  'Sin escrituras offline para FE, cobros ni facturas',
];

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      apiGet<HealthResponse>('/api/health'),
      apiGet<MetaResponse>('/api/meta/bootstrap'),
    ])
      .then(([healthResponse, metaResponse]) => {
        setHealth(healthResponse);
        setMeta(metaResponse);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No fue posible consultar la API');
      });
  }, []);

  const remainingSprints = useMemo(() => {
    const match = meta?.currentSprint.match(/Sprint\s+(\d+)/i);
    const currentNumber = match ? Number(match[1]) : 20;
    return {
      includingCurrent: 26 - currentNumber + 1,
      afterCurrent: 26 - currentNumber,
    };
  }, [meta]);

  return (
    <section>
      <header className="hero">
        <span className="badge">{meta?.currentSprint ?? 'Sprint actual'}</span>
        <h2>Base de migración inicial</h2>
        <p>
          Esta pantalla valida el arranque del nuevo shell frontend, la conexión básica hacia la API
          y la preparación inicial del modo lectura offline del backoffice.
        </p>
      </header>

      <div className="grid dashboard-grid">
        <div className="status-panel">
          <h3>Estado de la API</h3>
          {health ? (
            <ul>
              <li><strong>Servicio:</strong> {health.service}</li>
              <li><strong>Estado:</strong> {health.status}</li>
              <li><strong>Driver DB:</strong> {health.database.driver}</li>
              <li><strong>Host DB:</strong> {health.database.host}</li>
            </ul>
          ) : (
            <p>{error ?? 'Consultando health endpoint...'}</p>
          )}
        </div>

        <div className="status-panel offline-panel">
          <h3>Modo offline</h3>
          <p><strong>Conectividad:</strong> {online ? 'En línea' : 'Sin conexión'}</p>
          <p><strong>Lectura offline:</strong> activa para shell y consultas permitidas.</p>
          <ul className="status-list">
            {offlineScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {meta ? (
        <div className="status-panel roadmap-panel">
          <h3>Roadmap en ejecución</h3>
          <p><strong>Estado:</strong> {meta.status}</p>
          <p><strong>Completado:</strong> {meta.completed.join(', ')}</p>
          <p><strong>Siguiente:</strong> {meta.next.join(', ')}</p>
          <p>
            <strong>Sprints restantes:</strong> {remainingSprints.includingCurrent} contando el actual,
            {` `}{remainingSprints.afterCurrent} después de este sprint.
          </p>
        </div>
      ) : null}

      <div className="grid">
        {checkpoints.map((item) => (
          <article key={item} className="card">
            <h3>{item}</h3>
            <p>Preparado como parte de la fundación técnica del roadmap.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
