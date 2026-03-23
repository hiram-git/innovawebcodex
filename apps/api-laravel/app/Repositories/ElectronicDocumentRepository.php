<?php

namespace App\Repositories;

use App\Support\Env;
use PDO;

final class ElectronicDocumentRepository
{
    private function connect(): PDO
    {
        $pdo = new PDO(sprintf(
            'sqlsrv:Server=%s,%s;Database=%s',
            Env::get('DB_HOST', '127.0.0.1'),
            Env::get('DB_PORT', '1433'),
            Env::get('DB_DATABASE', '')
        ), Env::get('DB_USERNAME', ''), Env::get('DB_PASSWORD', ''));
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;
    }

    public function list(int $limit = 20): array
    {
        $limit = max(1, min($limit, 100));
        $sql = "SELECT TOP {$limit}
                t.CONTROL,
                t.NUMREF,
                t.NOMBRE,
                t.MONTOTOT,
                d.RESULTADO,
                d.CUFE,
                d.FECHARECEPCIONDGI,
                d.NUMDOCFISCAL
            FROM TRANSACCMAESTRO t
            LEFT JOIN Documentos d ON d.CONTROL = t.CONTROL
            WHERE t.TIPTRAN = 'FAC' AND t.TIPREG = 1
            ORDER BY t.FECEMISS DESC";

        return $this->connect()->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(string $control): array|false
    {
        $sql = "SELECT TOP 1
                t.CONTROL,
                t.NUMREF,
                t.NOMBRE,
                t.MONTOTOT,
                d.RESULTADO,
                d.MENSAJE,
                d.CUFE,
                d.QR,
                d.FECHARECEPCIONDGI,
                d.NROPROTOCOLOAYTORIZACION,
                d.FECHALIMITE,
                d.NUMDOCFISCAL,
                d.PDF,
                d.[XML]
            FROM TRANSACCMAESTRO t
            LEFT JOIN Documentos d ON d.CONTROL = t.CONTROL
            WHERE t.CONTROL = :control";

        $stmt = $this->connect()->prepare($sql);
        $stmt->bindValue(':control', $control);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function artifact(string $control, string $type): array|false
    {
        $document = $this->find($control);
        if (!$document) {
            return false;
        }

        $type = strtolower($type);
        $field = match ($type) {
            'pdf' => 'PDF',
            'xml' => 'XML',
            'qr' => 'QR',
            default => null,
        };

        if ($field === null) {
            return false;
        }

        $available = !empty($document[$field]);

        return [
            'control' => $control,
            'type' => $type,
            'available' => $available,
            'downloadUrl' => $available ? sprintf('/api/v1/electronic-documents/artifact?control=%s&type=%s', urlencode($control), $type) : null,
            'mimeType' => match ($type) {
                'pdf' => 'application/pdf',
                'xml' => 'application/xml',
                'qr' => 'image/png',
                default => 'application/octet-stream',
            },
            'preview' => $available ? sprintf('Scaffold %s listo para %s.', strtoupper($type), $control) : sprintf('No hay %s disponible para %s.', strtoupper($type), $control),
        ];
    }
}
