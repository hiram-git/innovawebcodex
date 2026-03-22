import { useEffect, useState } from 'react';
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

type ElectronicDocumentResponse = {
  data: ElectronicDocument[];
};

type ElectronicDocumentDetailResponse = {
  data: ElectronicDocumentDetail;
};

export function ElectronicDocumentsPage() {
  const [documents, setDocuments] = useState<ElectronicDocument[]>([]);
  const [selected, setSelected] = useState<ElectronicDocumentDetail | null>(null);
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

  const handleSelect = async (control: string) => {
    try {
      const response = await apiGet<ElectronicDocumentDetailResponse>(`/api/v1/electronic-documents/detail?control=${encodeURIComponent(control)}`);
      setSelected(response.data);
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'No fue posible consultar el detalle FE.');
    }
  };

  return (
    <section>
      <header className="hero">
        <span className="badge">Sprint 6</span>
        <h2>Consulta inicial de documentos FE</h2>
        <p>Listado y detalle base para reemplazar progresivamente la consola legacy de facturación electrónica.</p>
      </header>

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
              {documents.map((document) => (
                <tr key={document.CONTROL} onClick={() => handleSelect(document.CONTROL)}>
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
            <ul>
              <li><strong>Control:</strong> {selected.CONTROL}</li>
              <li><strong>CUFE:</strong> {selected.CUFE || '—'}</li>
              <li><strong>Resultado:</strong> {selected.RESULTADO || '—'}</li>
              <li><strong>Recepción DGI:</strong> {selected.FECHARECEPCIONDGI || '—'}</li>
              <li><strong>Mensaje:</strong> {selected.MENSAJE || '—'}</li>
              <li><strong>PDF:</strong> {selected.PDF ? 'Disponible' : 'No disponible'}</li>
              <li><strong>XML:</strong> {selected.XML ? 'Disponible' : 'No disponible'}</li>
            </ul>
          ) : (
            <p>Selecciona un documento para ver su detalle.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
