import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api/client';

type ElectronicDocument = {
  CONTROL: string;
  NUMREF: string;
  NOMBRE: string;
  MONTOTOT: string;
  RESULTADO: string;
  CUFE: string;
  FECHARECEPCIONDGI: string;
  NUMDOCFISCAL: string;
};

type ElectronicDocumentDetail = ElectronicDocument & {
  MENSAJE?: string;
  QR?: string;
  PDF?: string;
  XML?: string;
};

type ArtifactResponse = {
  data: {
    control: string;
    type: string;
    available: boolean;
    downloadUrl: string | null;
    mimeType: string;
    preview: string;
  };
};

type ElectronicDocumentResponse = {
  data: ElectronicDocument[];
};

type ElectronicDocumentDetailResponse = {
  data: ElectronicDocumentDetail;
};

export function ElectronicDocumentsPage() {
  const [documents, setDocuments] = useState<ElectronicDocument[]>([]);
  const [selected, setSelected] = useState<ElectronicDocumentDetail | null>(null);
  const [artifactPreview, setArtifactPreview] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Cargando documentos FE...');

  useEffect(() => {
    apiGet<ElectronicDocumentResponse>('/api/v1/electronic-documents?limit=10')
      .then((response) => {
        setDocuments(response.data);
        setStatus(response.data.length ? '' : 'No se encontraron documentos electrónicos.');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'No fue posible consultar documentos FE.');
      });
  }, []);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const matchesStatus = statusFilter === '' || (document.RESULTADO || 'Pendiente') === statusFilter;
        const haystack = `${document.CONTROL} ${document.NUMREF} ${document.NOMBRE}`.toLowerCase();
        const matchesSearch = search === '' || haystack.includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
      }),
    [documents, search, statusFilter],
  );

  const handleSelect = async (control: string) => {
    try {
      const response = await apiGet<ElectronicDocumentDetailResponse>(`/api/v1/electronic-documents/detail?control=${encodeURIComponent(control)}`);
      setSelected(response.data);
      setArtifactPreview('');
      setStatus('');
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible consultar el detalle FE.');
    }
  };

  const loadArtifact = async (type: 'pdf' | 'xml' | 'qr') => {
    if (!selected) {
      setStatus('Selecciona un documento antes de intentar consultar artefactos FE.');
      return;
    }

    try {
      const response = await apiGet<ArtifactResponse>(`/api/v1/electronic-documents/artifact?control=${encodeURIComponent(selected.CONTROL)}&type=${type}`);
      setArtifactPreview(response.data.preview);
      setStatus(response.data.available ? `${type.toUpperCase()} consultado para ${selected.CONTROL}.` : `${type.toUpperCase()} no disponible para ${selected.CONTROL}.`);
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible consultar el artefacto FE.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 14</span>
        <h2>Consulta FE</h2>
        <p>Listado, filtros, detalle operativo y descargas scaffold para la futura consola fiscal moderna.</p>
      </header>

      <div className="table-card">
        <form className="payment-form" onSubmit={(event) => event.preventDefault()}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por control, ref o cliente" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="APROBADO">APROBADO</option>
            <option value="RECHAZADO">RECHAZADO</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </form>
      </div>

      {status ? <p className="status-copy">{status}</p> : null}

      <div className="grid documents-layout">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Control</th>
                <th>Ref</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr
                  key={document.CONTROL}
                  className={selected?.CONTROL === document.CONTROL ? 'selected-row' : ''}
                  onClick={() => handleSelect(document.CONTROL)}
                >
                  <td>{document.CONTROL}</td>
                  <td>{document.NUMREF}</td>
                  <td>{document.NOMBRE}</td>
                  <td>{document.RESULTADO || 'Pendiente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="status-panel">
          <h3>Detalle FE</h3>
          {selected ? (
            <>
              <ul className="status-list">
                <li><strong>Control:</strong> {selected.CONTROL}</li>
                <li><strong>Ref:</strong> {selected.NUMREF || '—'}</li>
                <li><strong>Doc fiscal:</strong> {selected.NUMDOCFISCAL || '—'}</li>
                <li><strong>CUFE:</strong> {selected.CUFE || '—'}</li>
                <li><strong>Resultado:</strong> {selected.RESULTADO || '—'}</li>
                <li><strong>Recepción DGI:</strong> {selected.FECHARECEPCIONDGI || '—'}</li>
                <li><strong>Monto total:</strong> {selected.MONTOTOT || '—'}</li>
                <li><strong>Mensaje:</strong> {selected.MENSAJE || '—'}</li>
              </ul>

              <div className="auth-actions">
                <button type="button" onClick={() => loadArtifact('pdf')}>Descargar PDF</button>
                <button type="button" onClick={() => loadArtifact('xml')}>Descargar XML</button>
                <button type="button" onClick={() => loadArtifact('qr')}>Ver QR</button>
              </div>

              <div className="card">
                <h4>Disponibilidad de artefactos</h4>
                <p>PDF: {selected.PDF ? 'Disponible' : 'No disponible'}</p>
                <p>XML: {selected.XML ? 'Disponible' : 'No disponible'}</p>
                <p>QR: {selected.QR ? 'Disponible' : 'No disponible'}</p>
                <p className="artifact-preview">{artifactPreview || 'Todavía no se ha consultado un artefacto FE.'}</p>
              </div>
            </>
          ) : (
            <p>Selecciona un documento para ver su detalle.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
