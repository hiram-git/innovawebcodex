<?php

namespace App\Services\ElectronicInvoicing;

use App\Contracts\ElectronicInvoiceProviderInterface;

final class TheFactoryHkaProvider implements ElectronicInvoiceProviderInterface
{
    public function dispatch(array $payload): array
    {
        $invoice = $payload['invoice'] ?? [];
        $trace = $payload['trace'] ?? [];
        $config = $this->config();
        $providerReference = sprintf('TFHKA-%s', strtoupper(substr(sha1((string) ($invoice['id'] ?? uniqid('', true))), 0, 10)));
        $controlNumber = sprintf('TF-%s', strtoupper(substr(md5($providerReference), 0, 12)));
        $cufe = hash('sha256', implode('|', [
            $providerReference,
            $invoice['id'] ?? '',
            $payload['documentType'] ?? '01',
            $invoice['subtotal'] ?? 0,
        ]));

        $normalizedPayload = [
            'adapter' => 'the-factory-hka',
            'credentials' => [
                'taxId' => $config['taxId'],
                'terminalCode' => $config['terminalCode'],
                'mode' => $config['mode'],
            ],
            'document' => [
                'invoiceId' => $invoice['id'] ?? null,
                'documentType' => $payload['documentType'] ?? '01',
                'currency' => $invoice['currency'] ?? 'USD',
                'customerCode' => $invoice['customerCode'] ?? null,
                'customerName' => $invoice['customerName'] ?? null,
                'subtotal' => $invoice['subtotal'] ?? 0,
                'lines' => array_map(
                    static fn (array $item): array => [
                        'sku' => $item['sku'] ?? '',
                        'description' => $item['description'] ?? '',
                        'qty' => $item['quantity'] ?? 0,
                        'price' => $item['unitPrice'] ?? 0,
                        'total' => $item['lineTotal'] ?? 0,
                    ],
                    $invoice['items'] ?? [],
                ),
            ],
            'trace' => $trace,
        ];

        return [
            'provider' => $this->providerName(),
            'status' => 'queued',
            'message' => 'Documento preparado para envío mediante adapter The Factory HKA.',
            'request' => $normalizedPayload,
            'response' => [
                'providerStatus' => 'accepted-for-queue',
                'providerReference' => $providerReference,
                'estimatedMode' => 'async',
                'environment' => $config['mode'],
            ],
            'correlation' => [
                'controlNumber' => $controlNumber,
                'cufe' => $cufe,
                'providerReference' => $providerReference,
            ],
            'capabilities' => [
                'supportsCancellation' => true,
                'supportsContingency' => false,
                'supportedDocumentTypes' => ['01', '04'],
                'supportsRetry' => true,
            ],
            'technical' => [
                'endpoint' => '/ws/fe/dispatch',
                'transport' => 'soap-bridge-simulated',
                'latencyMs' => 120,
                'environment' => $config['mode'],
            ],
        ];
    }

    public function supportsDocumentType(string $documentType): bool
    {
        return in_array($documentType, ['01', '04'], true);
    }

    public function providerName(): string
    {
        return 'the-factory-hka';
    }

    private function config(): array
    {
        return [
            'taxId' => $_ENV['TFHKA_TAX_ID'] ?? '000000000',
            'terminalCode' => $_ENV['TFHKA_TERMINAL_CODE'] ?? 'TERM-01',
            'mode' => $_ENV['TFHKA_MODE'] ?? 'sandbox',
        ];
    }
}
