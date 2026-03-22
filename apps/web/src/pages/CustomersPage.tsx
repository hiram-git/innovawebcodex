import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

type Customer = {
  CODIGO: string;
  NOMBRE: string;
  NUMTEL: string;
  DIRCORREO: string;
  TIPOCOMERCIO: string;
};

type CustomerResponse = {
  data: Customer[];
  meta: {
    limit: number;
    search: string;
  };
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [status, setStatus] = useState('Cargando clientes...');

  useEffect(() => {
    apiGet<CustomerResponse>('/api/v1/customers?limit=10')
      .then((response) => {
        setCustomers(response.data);
        setStatus(response.data.length ? '' : 'No se encontraron clientes.');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar clientes.');
      });
  }, []);

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 5</span>
        <h2>Módulo inicial de clientes</h2>
        <p>Lectura básica desde la nueva API para sustituir gradualmente el listado legacy.</p>
      </header>

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.CODIGO}>
                <td>{customer.CODIGO}</td>
                <td>{customer.NOMBRE}</td>
                <td>{customer.NUMTEL || '—'}</td>
                <td>{customer.DIRCORREO || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
