import { useEffect, useMemo, useState } from 'react';
import { useSyncQueueStore } from '../store/syncQueue';

export function SyncQueueCard() {
  const { items, hydrated, hydrate, flush, clear } = useSyncQueueStore();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncMessage, setSyncMessage] = useState('Sincronización diferida lista para Sprint 21.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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

  const pendingCount = useMemo(() => items.length, [items]);

  const processQueue = async () => {
    if (!online || busy || items.length === 0) {
      return;
    }

    setBusy(true);
    try {
      const result = await flush(async (item) => {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.payload),
        });

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status}`);
        }
      });

      setSyncMessage(`Sincronizados: ${result.synced}. Pendientes con error: ${result.failed}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card sync-card">
      <h3>Sync diferido</h3>
      <p>{online ? 'Conectado' : 'Sin conexión'}</p>
      <p>{hydrated ? `${pendingCount} operación(es) en cola` : 'Cargando cola local...'}</p>
      <p>{syncMessage}</p>
      <div className="sync-actions">
        <button type="button" onClick={processQueue} disabled={!online || pendingCount === 0 || busy}>
          {busy ? 'Sincronizando...' : 'Sincronizar cola'}
        </button>
        <button type="button" onClick={clear} disabled={pendingCount === 0 || busy}>
          Limpiar cola
        </button>
      </div>
    </div>
  );
}
