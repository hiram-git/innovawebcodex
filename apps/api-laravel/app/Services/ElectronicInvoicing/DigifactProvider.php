<?php

namespace App\Services\ElectronicInvoicing;

use App\Contracts\ElectronicInvoiceProviderInterface;

final class DigifactProvider implements ElectronicInvoiceProviderInterface
{
    public function dispatch(array $payload): array
    {
        $invoice = $payload['invoice'] ?? [];
        $trace = $payload['trace'] ?? [];
        $config = $this->config();
        $providerReference = sprintf('DIGI-%s', strtoupper(substr(md5((string) ($invoice['id'] ?? uniqid('', true))), 0, 10)));
        $controlNumber = sprintf('DG-%s', strtoupper(substr(sha1($providerReference), 0, 12)));
        $cufe = hash('sha256', implode('|', [
            $providerReference,
            $invoice['id'] ?? '',
            $payload['documentType'] ?? '01',
            $invoice['subtotal'] ?? 0,
        ]));

        $normalizedPayload = [
            'adapter' => 'digifact',
            'credentials' => [
                'nit' => $config['nit'],
                'issuerCode' => $config['issuerCode'],
                'mode' => $config['mode'],
            ],
            'emission' => [
                'invoice_uuid' => $invoice['id'] ?? null,
                'tipo_documento' => $payload['documentType'] ?? '01',
                'moneda' => $invoice['currency'] ?? 'USD',
                'cliente' => [
                    'codigo' => $invoice['customerCode'] ?? null,
                    'nombre' => $invoice['customerName'] ?? null,
                ],
                'totales' => [
                    'subtotal' => $invoice['subtotal'] ?? 0,
                    'items' => count($invoice['items'] ?? []),
                ],
            ],
            'trace' => $trace,
        ];

        return [
            'provider' => $this->providerName(),
            'status' => 'queued',
            'message' => 'Documento preparado para envío mediante adapter Digifact.',
            'request' => $normalizedPayload,
            'response' => [
                'providerStatus' => 'received',
                'providerReference' => $providerReference,
                'estimatedMode' => 'api-rest',
                'environment' => $config['mode'],
            ],
            'correlation' => [
                'controlNumber' => $controlNumber,
                'cufe' => $cufe,
                'providerReference' => $providerReference,
            ],
            'capabilities' => [
                'supportsCancellation' => true,
                'supportsContingency' => true,
                'supportedDocumentTypes' => ['01', '03', '04'],
                'supportsRetry' => true,
            ],
            'technical' => [
                'endpoint' => '/api/v1/dte/dispatch',
                'transport' => 'rest-json-simulated',
                'latencyMs' => 95,
                'environment' => $config['mode'],
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

    private function config(): array
    {
        return [
            'nit' => $_ENV['DIGIFACT_NIT'] ?? 'CF',
            'issuerCode' => $_ENV['DIGIFACT_ISSUER_CODE'] ?? 'DIGI-LOCAL',
            'mode' => $_ENV['DIGIFACT_MODE'] ?? 'sandbox',
        ];
    }
}
