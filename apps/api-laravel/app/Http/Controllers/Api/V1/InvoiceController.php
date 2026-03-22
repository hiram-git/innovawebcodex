<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\InvoiceDraftRepository;

final class InvoiceController
{
    public function __construct(private readonly InvoiceDraftRepository $repository = new InvoiceDraftRepository())
    {
    }

    public function index(): array
    {
        $limit = (int) ($_GET['limit'] ?? 20);

        return [
            'data' => $this->repository->all($limit),
            'meta' => ['limit' => $limit],
        ];
    }

    public function store(): array
    {
        $payload = json_decode(file_get_contents('php://input') ?: '[]', true);
        if (!is_array($payload)) {
            return [
                '_status' => 400,
                'message' => 'Payload inválido.',
            ];
        }

        $idempotencyKey = trim((string) ($payload['idempotencyKey'] ?? $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? ''));
        $customerCode = trim((string) ($payload['customerCode'] ?? ''));
        $customerName = trim((string) ($payload['customerName'] ?? ''));
        $currency = trim((string) ($payload['currency'] ?? 'USD'));
        $items = $payload['items'] ?? [];

        if ($idempotencyKey === '' || $customerCode === '' || $customerName === '' || !is_array($items) || count($items) === 0) {
            return [
                '_status' => 422,
                'message' => 'idempotencyKey, customerCode, customerName e items son obligatorios.',
            ];
        }

        $normalizedItems = [];
        $subtotal = 0.0;
        foreach ($items as $item) {
            $sku = trim((string) ($item['sku'] ?? ''));
            $description = trim((string) ($item['description'] ?? ''));
            $quantity = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unitPrice'] ?? 0);

            if ($sku === '' || $description === '' || $quantity <= 0 || $unitPrice < 0) {
                return [
                    '_status' => 422,
                    'message' => 'Cada item debe incluir sku, description, quantity y unitPrice válidos.',
                ];
            }

            $lineTotal = round($quantity * $unitPrice, 2);
            $subtotal += $lineTotal;
            $normalizedItems[] = [
                'sku' => $sku,
                'description' => $description,
                'quantity' => $quantity,
                'unitPrice' => $unitPrice,
                'lineTotal' => $lineTotal,
            ];
        }

        $existing = $this->repository->findByIdempotencyKey($idempotencyKey);
        if ($existing) {
            return [
                'data' => $existing,
                'meta' => ['idempotent' => true],
            ];
        }

        $record = [
            'id' => uniqid('inv_', true),
            'idempotencyKey' => $idempotencyKey,
            'customerCode' => $customerCode,
            'customerName' => $customerName,
            'currency' => $currency,
            'items' => $normalizedItems,
            'subtotal' => round($subtotal, 2),
            'status' => 'draft',
            'createdAt' => gmdate(DATE_ATOM),
            'source' => 'sprint-8-scaffold',
        ];

        return [
            'data' => $this->repository->append($record),
            'meta' => ['idempotent' => false],
        ];
    }
}
