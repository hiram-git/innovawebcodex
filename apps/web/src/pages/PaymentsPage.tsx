import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

type PaymentRecord = {
  id: string;
  idempotencyKey: string;
  control: string;
  reference: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
};

type PaymentsResponse = {
  data: PaymentRecord[];
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [status, setStatus] = useState('Cargando pagos...');

  const loadPayments = () => {
    apiGet<PaymentsResponse>('/api/v1/payments?limit=10')
      .then((response) => {
        setPayments(response.data);
        setStatus(response.data.length ? '' : 'No hay pagos registrados en el scaffold.');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar pagos.');
      });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const submitDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Registrando draft de pago...');
    const formData = new FormData(event.currentTarget);
    const payload = {
      idempotencyKey: String(formData.get('idempotencyKey') || ''),
      control: String(formData.get('control') || ''),
      reference: String(formData.get('reference') || ''),
      amount: Number(formData.get('amount') || 0),
      method: String(formData.get('method') || ''),
    };

    try {
      const response = await fetch('http://127.0.0.1:18080/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      await response.json();
      event.currentTarget.reset();
      setStatus('Pago draft registrado.');
      loadPayments();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible registrar el pago.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 7</span>
        <h2>Cobros / pagos iniciales</h2>
        <p>Scaffold de pagos con auditoría e idempotencia mínima para preparar la migración del flujo de cobros.</p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={submitDraft}>
          <input name="idempotencyKey" placeholder="Idempotency key" required />
          <input name="control" placeholder="Control factura" required />
          <input name="reference" placeholder="Referencia" required />
          <input name="amount" placeholder="Monto" type="number" step="0.01" required />
          <input name="method" placeholder="Método" required />
          <button type="submit">Registrar draft</button>
        </form>
      </div>

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Control</th>
              <th>Referencia</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.control}</td>
                <td>{payment.reference}</td>
                <td>{payment.amount}</td>
                <td>{payment.method}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
