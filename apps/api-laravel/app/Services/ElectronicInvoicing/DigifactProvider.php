<?php

namespace App\Services\ElectronicInvoicing;

use App\Contracts\ElectronicInvoiceProviderInterface;

final class DigifactProvider implements ElectronicInvoiceProviderInterface
{
    public function dispatch(array $payload): array
    {
        $normalizedPayload = [
            'adapter' => 'digifact',
            'emission' => [
                'invoice_uuid' => $payload['invoice']['id'] ?? null,
                'tipo_documento' => $payload['documentType'] ?? '01',
                'moneda' => $payload['invoice']['currency'] ?? 'USD',
                'cliente' => [
                    'codigo' => $payload['invoice']['customerCode'] ?? null,
                    'nombre' => $payload['invoice']['customerName'] ?? null,
                ],
                'totales' => [
                    'subtotal' => $payload['invoice']['subtotal'] ?? 0,
                    'items' => count($payload['invoice']['items'] ?? []),
                ],
            ],
            'trace' => $payload['trace'] ?? [],
        ];

        return [
            'provider' => $this->providerName(),
            'status' => 'queued',
            'message' => 'Documento preparado para envío mediante adapter Digifact.',
            'request' => $normalizedPayload,
            'response' => [
                'providerStatus' => 'received',
                'providerReference' => sprintf('DIGI-%s', strtoupper(substr(md5((string) ($payload['invoice']['id'] ?? uniqid('', true))), 0, 10))),
                'estimatedMode' => 'api-rest',
            ],
            'capabilities' => [
                'supportsCancellation' => true,
                'supportsContingency' => true,
                'supportedDocumentTypes' => ['01', '03', '04'],
            ],
            'technical' => [
                'endpoint' => '/api/v1/dte/dispatch',
                'transport' => 'rest-json-simulated',
                'latencyMs' => 95,
            ],
        ];
    }

    public function supportsDocumentType(string $documentType): bool
    {
        return in_array($documentType, ['01', '03', '04'], true);
    }

    public function providerName(): string
    {
        return 'digifact';
    }
}
