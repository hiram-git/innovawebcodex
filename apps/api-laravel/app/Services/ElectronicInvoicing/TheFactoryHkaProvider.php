<?php

namespace App\Services\ElectronicInvoicing;

use App\Contracts\ElectronicInvoiceProviderInterface;

final class TheFactoryHkaProvider implements ElectronicInvoiceProviderInterface
{
    public function dispatch(array $payload): array
    {
        $normalizedPayload = [
            'adapter' => 'the-factory-hka',
            'document' => [
                'invoiceId' => $payload['invoice']['id'] ?? null,
                'documentType' => $payload['documentType'] ?? '01',
                'currency' => $payload['invoice']['currency'] ?? 'USD',
                'customerCode' => $payload['invoice']['customerCode'] ?? null,
                'customerName' => $payload['invoice']['customerName'] ?? null,
                'subtotal' => $payload['invoice']['subtotal'] ?? 0,
                'lines' => array_map(
                    static fn (array $item): array => [
                        'sku' => $item['sku'] ?? '',
                        'description' => $item['description'] ?? '',
                        'qty' => $item['quantity'] ?? 0,
                        'price' => $item['unitPrice'] ?? 0,
                        'total' => $item['lineTotal'] ?? 0,
                    ],
                    $payload['invoice']['items'] ?? [],
                ),
            ],
            'trace' => $payload['trace'] ?? [],
        ];

        return [
            'provider' => $this->providerName(),
            'status' => 'queued',
            'message' => 'Documento preparado para envío mediante adapter The Factory HKA.',
            'request' => $normalizedPayload,
            'response' => [
                'providerStatus' => 'accepted-for-queue',
                'providerReference' => sprintf('TFHKA-%s', strtoupper(substr(sha1((string) ($payload['invoice']['id'] ?? uniqid('', true))), 0, 10))),
                'estimatedMode' => 'async',
            ],
            'capabilities' => [
                'supportsCancellation' => true,
                'supportsContingency' => false,
                'supportedDocumentTypes' => ['01', '04'],
            ],
            'technical' => [
                'endpoint' => '/ws/fe/dispatch',
                'transport' => 'soap-bridge-simulated',
                'latencyMs' => 120,
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
}
