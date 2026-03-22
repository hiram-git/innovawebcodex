import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

type InvoiceRecord = {
  id: string;
  idempotencyKey: string;
  customerCode: string;
  customerName: string;
  currency: string;
  subtotal: number;
  status: string;
  createdAt: string;
};

type InvoicesResponse = {
  data: InvoiceRecord[];
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [status, setStatus] = useState('Cargando drafts de factura...');

  const loadInvoices = () => {
    apiGet<InvoicesResponse>('/api/v1/invoices?limit=10')
      .then((response) => {
        setInvoices(response.data);
        setStatus(response.data.length ? '' : 'No hay drafts de factura registrados.');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar facturas.');
      });
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const submitDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Registrando draft de factura...');
    const formData = new FormData(event.currentTarget);
    const payload = {
      idempotencyKey: String(formData.get('idempotencyKey') || ''),
      customerCode: String(formData.get('customerCode') || ''),
      customerName: String(formData.get('customerName') || ''),
      currency: String(formData.get('currency') || 'USD'),
      items: [
        {
          sku: String(formData.get('sku') || ''),
          description: String(formData.get('description') || ''),
          quantity: Number(formData.get('quantity') || 0),
          unitPrice: Number(formData.get('unitPrice') || 0),
        },
      ],
    };

    try {
      const response = await fetch('http://127.0.0.1:18080/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      await response.json();
      event.currentTarget.reset();
      setStatus('Draft de factura registrado.');
      loadInvoices();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible registrar la factura.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 8</span>
        <h2>Facturación inicial</h2>
        <p>Scaffold para drafts de factura, preparando el reemplazo del flujo legacy de facturación.</p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={submitDraft}>
          <input name="idempotencyKey" placeholder="Idempotency key" required />
          <input name="customerCode" placeholder="Código cliente" required />
          <input name="customerName" placeholder="Nombre cliente" required />
          <input name="currency" placeholder="Moneda" defaultValue="USD" required />
          <input name="sku" placeholder="SKU" required />
          <input name="description" placeholder="Descripción" required />
          <input name="quantity" placeholder="Cantidad" type="number" step="0.01" required />
          <input name="unitPrice" placeholder="Precio unitario" type="number" step="0.01" required />
          <button type="submit">Registrar draft</button>
        </form>
      </div>

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Cliente</th>
              <th>Moneda</th>
              <th>Subtotal</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.customerCode} - {invoice.customerName}</td>
                <td>{invoice.currency}</td>
                <td>{invoice.subtotal}</td>
                <td>{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
