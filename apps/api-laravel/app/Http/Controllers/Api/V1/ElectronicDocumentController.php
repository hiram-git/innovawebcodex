<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\ElectronicDocumentRepository;
use PDOException;

final class ElectronicDocumentController
{
    public function __construct(private readonly ElectronicDocumentRepository $repository = new ElectronicDocumentRepository())
    {
    }

    public function index(): array
    {
        $limit = (int) ($_GET['limit'] ?? 20);

        try {
            return [
                'data' => $this->repository->list($limit),
                'meta' => ['limit' => $limit],
            ];
        } catch (PDOException $exception) {
            return [
                '_status' => 500,
                'message' => 'No fue posible consultar documentos electrónicos.',
                'error' => $exception->getMessage(),
            ];
        }
    }

    public function show(): array
    {
        $control = trim((string) ($_GET['control'] ?? ''));

        if ($control === '') {
            return [
                '_status' => 422,
                'message' => 'El parámetro control es obligatorio.',
            ];
        }

        try {
            $document = $this->repository->find($control);
            if (!$document) {
                return [
                    '_status' => 404,
                    'message' => 'Documento electrónico no encontrado.',
                ];
            }

            return ['data' => $document];
        } catch (PDOException $exception) {
            return [
                '_status' => 500,
                'message' => 'No fue posible consultar el detalle del documento electrónico.',
                'error' => $exception->getMessage(),
            ];
        }
    }
}
