import { useEffect, useMemo, useState } from 'react';
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

const emptyDraft: Customer = {
  CODIGO: '',
  NOMBRE: '',
  NUMTEL: '',
  DIRCORREO: '',
  TIPOCOMERCIO: '',
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [draft, setDraft] = useState<Customer>(emptyDraft);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Cargando clientes...');

  const loadCustomers = (searchValue = '') => {
    setStatus('Cargando clientes...');
    apiGet<CustomerResponse>(`/api/v1/customers?limit=10&search=${encodeURIComponent(searchValue)}`)
      .then((response) => {
        setCustomers(response.data);
        const nextSelected = response.data[0]?.CODIGO ?? '';
        setSelectedCode((current) => (current && response.data.some((item) => item.CODIGO === current) ? current : nextSelected));
        setStatus(response.data.length ? '' : 'No se encontraron clientes.');
      })
      .catch((error: unknown) => {
        setCustomers([]);
        setSelectedCode('');
        setDraft(emptyDraft);
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar clientes.');
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.CODIGO === selectedCode) ?? null,
    [customers, selectedCode],
  );

  useEffect(() => {
    if (selectedCustomer) {
      setDraft(selectedCustomer);
    }
  }, [selectedCustomer]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadCustomers(search);
  };

  const updateDraft = (field: keyof Customer, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.CODIGO) {
      setStatus('Selecciona un cliente antes de editar.');
      return;
    }

    setCustomers((current) => current.map((customer) => (customer.CODIGO === draft.CODIGO ? draft : customer)));
    setStatus('Edición local aplicada en el scaffold. Persistencia real queda para integración backend posterior.');
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 13</span>
        <h2>Módulo de clientes</h2>
        <p>Búsqueda, detalle y edición scaffold para acelerar la futura integración completa del backoffice.</p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={submitSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código o nombre"
          />
          <button type="submit">Buscar</button>
        </form>
      </div>

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="customers-layout">
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
                <tr
                  key={customer.CODIGO}
                  className={customer.CODIGO === selectedCode ? 'selected-row' : ''}
                  onClick={() => setSelectedCode(customer.CODIGO)}
                >
                  <td>{customer.CODIGO}</td>
                  <td>{customer.NOMBRE}</td>
                  <td>{customer.NUMTEL || '—'}</td>
                  <td>{customer.DIRCORREO || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3>Detalle / edición</h3>
          {selectedCustomer ? (
            <form className="customer-form" onSubmit={saveDraft}>
              <input value={draft.CODIGO} readOnly />
              <input value={draft.NOMBRE} onChange={(event) => updateDraft('NOMBRE', event.target.value)} placeholder="Nombre" />
              <input value={draft.NUMTEL} onChange={(event) => updateDraft('NUMTEL', event.target.value)} placeholder="Teléfono" />
              <input value={draft.DIRCORREO} onChange={(event) => updateDraft('DIRCORREO', event.target.value)} placeholder="Correo" />
              <input value={draft.TIPOCOMERCIO} onChange={(event) => updateDraft('TIPOCOMERCIO', event.target.value)} placeholder="Tipo comercio" />
              <button type="submit">Guardar cambios</button>
            </form>
          ) : (
            <p>Selecciona un cliente para ver su detalle.</p>
          )}
        </div>
      </div>
    </section>
  );
}
