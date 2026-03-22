import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

type DispatchRecord = {
  id: string;
  idempotencyKey: string;
  provider: string;
  invoiceId: string;
  documentType: string;
  status: string;
  message: string;
  createdAt: string;
  correlation?: {
    controlNumber?: string;
    cufe?: string;
    providerReference?: string;
  };
  response?: {
    providerReference?: string;
    providerStatus?: string;
    estimatedMode?: string;
    environment?: string;
  };
  technical?: {
    endpoint?: string;
    transport?: string;
    latencyMs?: number;
    environment?: string;
  };
  trace?: {
    source?: string;
    invoiceStatus?: string;
    retryFromDispatchId?: string | null;
    attempt?: number;
  };
};

type ProviderMeta = {
  provider: string;
  displayName: string;
  supportedDocumentTypes: string[];
};

type DispatchResponse = {
  data: DispatchRecord[];
  meta?: {
    providers?: ProviderMeta[];
  };
};

export function ElectronicDispatchPage() {
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [providers, setProviders] = useState<ProviderMeta[]>([]);
  const [status, setStatus] = useState('Cargando dispatch FE...');

  const loadDispatches = () => {
    apiGet<DispatchResponse>('/api/v1/electronic-dispatch?limit=10')
      .then((response) => {
        setDispatches(response.data);
        setProviders(response.meta?.providers || []);
        setStatus(response.data.length ? '' : 'No hay dispatches FE registrados.');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar dispatch FE.');
      });
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const submitDispatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Registrando dispatch FE...');
    const formData = new FormData(event.currentTarget);
    const payload = {
      idempotencyKey: String(formData.get('idempotencyKey') || ''),
      provider: String(formData.get('provider') || ''),
      invoiceId: String(formData.get('invoiceId') || ''),
      documentType: String(formData.get('documentType') || '01'),
      retryFromDispatchId: String(formData.get('retryFromDispatchId') || ''),
    };

    try {
      await apiPost('/api/v1/electronic-dispatch', payload);
      event.currentTarget.reset();
      setStatus('Dispatch FE registrado con correlación fiscal y trazabilidad técnica.');
      loadDispatches();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible registrar el dispatch FE.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 10</span>
        <h2>Dispatch FE / PAC</h2>
        <p>
          Hardening de adapters FE con configuración por ambiente, correlación fiscal simulada y reintentos técnicos.
        </p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={submitDispatch}>
          <input name="idempotencyKey" placeholder="Idempotency key" required />
          <select name="provider" defaultValue="the-factory-hka">
            {providers.length ? (
              providers.map((provider) => (
                <option key={provider.provider} value={provider.provider}>
                  {provider.displayName}
                </option>
              ))
            ) : (
              <>
                <option value="the-factory-hka">The Factory HKA</option>
                <option value="digifact">Digifact</option>
              </>
            )}
          </select>
          <input name="invoiceId" placeholder="Invoice draft id existente" required />
          <input name="documentType" placeholder="Tipo doc" defaultValue="01" required />
          <input name="retryFromDispatchId" placeholder="Retry desde dispatch (opcional)" />
          <button type="submit">Registrar dispatch</button>
        </form>
      </div>

      {providers.length ? (
        <div className="table-card">
          <h3>Providers disponibles</h3>
          <ul className="status-list">
            {providers.map((provider) => (
              <li key={provider.provider}>
                <strong>{provider.displayName}</strong> · tipos: {provider.supportedDocumentTypes.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Proveedor</th>
              <th>Factura</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Correlación fiscal</th>
              <th>Traza técnica</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((dispatch) => (
              <tr key={dispatch.id}>
                <td>{dispatch.id}</td>
                <td>{dispatch.provider}</td>
                <td>{dispatch.invoiceId}</td>
                <td>{dispatch.documentType}</td>
                <td>{dispatch.status}</td>
                <td>
                  <div><strong>{dispatch.correlation?.providerReference || dispatch.response?.providerReference || 'n/a'}</strong></div>
                  <div>{dispatch.correlation?.controlNumber || 'sin control'}</div>
                  <div>{dispatch.correlation?.cufe ? `${dispatch.correlation.cufe.slice(0, 16)}...` : 'sin cufe'}</div>
                </td>
                <td>
                  <div>{dispatch.technical?.transport || 'sin transporte'}</div>
                  <div>{dispatch.technical?.endpoint || 'sin endpoint'}</div>
                  <div>
                    intento {dispatch.trace?.attempt || 1} · {dispatch.technical?.environment || 'sin env'} ·{' '}
                    {dispatch.technical?.latencyMs ? `${dispatch.technical.latencyMs} ms` : 'sin latencia'}
                  </div>
                  <div>{dispatch.trace?.retryFromDispatchId ? `retry de ${dispatch.trace.retryFromDispatchId}` : 'primer envío'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
