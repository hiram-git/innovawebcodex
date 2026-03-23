import { useEffect, useState } from 'react';
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
];

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section>
      <header className="hero">
        <span className="badge">{meta?.currentSprint ?? 'Sprint actual'}</span>
        <h2>Base de migración inicial</h2>
        <p>
          Esta pantalla valida el arranque del nuevo shell frontend y la conexión básica
          hacia la API de modernización.
        </p>
      </header>

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

      {meta ? (
        <div className="status-panel">
          <h3>Roadmap en ejecución</h3>
          <p><strong>Estado:</strong> {meta.status}</p>
          <p><strong>Completado:</strong> {meta.completed.join(', ')}</p>
          <p><strong>Siguiente:</strong> {meta.next.join(', ')}</p>
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
