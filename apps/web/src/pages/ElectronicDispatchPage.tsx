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
  response?: {
    providerReference?: string;
    providerStatus?: string;
    estimatedMode?: string;
  };
  technical?: {
    endpoint?: string;
    transport?: string;
    latencyMs?: number;
  };
  trace?: {
    source?: string;
    invoiceStatus?: string;
  };
};

type DispatchResponse = {
  data: DispatchRecord[];
};

export function ElectronicDispatchPage() {
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [status, setStatus] = useState('Cargando dispatch FE...');

  const loadDispatches = () => {
    apiGet<DispatchResponse>('/api/v1/electronic-dispatch?limit=10')
      .then((response) => {
        setDispatches(response.data);
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
    };

    try {
      await apiPost('/api/v1/electronic-dispatch', payload);
      event.currentTarget.reset();
      setStatus('Dispatch FE registrado con trazabilidad técnica.');
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
          Hardening inicial de adapters FE con validación de invoice draft, trazabilidad técnica y referencia simulada
          del proveedor.
        </p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={submitDispatch}>
          <input name="idempotencyKey" placeholder="Idempotency key" required />
          <select name="provider" defaultValue="the-factory-hka">
            <option value="the-factory-hka">The Factory HKA</option>
            <option value="digifact">Digifact</option>
          </select>
          <input name="invoiceId" placeholder="Invoice draft id existente" required />
          <input name="documentType" placeholder="Tipo doc" defaultValue="01" required />
          <button type="submit">Registrar dispatch</button>
        </form>
      </div>

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
              <th>Referencia PAC</th>
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
                  <strong>{dispatch.response?.providerReference || 'n/a'}</strong>
                  <div>{dispatch.response?.providerStatus || dispatch.message}</div>
                </td>
                <td>
                  <div>{dispatch.technical?.transport || 'sin transporte'}</div>
                  <div>{dispatch.technical?.endpoint || 'sin endpoint'}</div>
                  <div>
                    {dispatch.technical?.latencyMs ? `${dispatch.technical.latencyMs} ms` : 'sin latencia'} ·{' '}
                    {dispatch.trace?.source || 'sin source'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
