<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\PaymentAuditRepository;

final class PaymentController
{
    public function __construct(private readonly PaymentAuditRepository $repository = new PaymentAuditRepository())
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
        $control = trim((string) ($payload['control'] ?? ''));
        $reference = trim((string) ($payload['reference'] ?? ''));
        $amount = (float) ($payload['amount'] ?? 0);
        $method = trim((string) ($payload['method'] ?? ''));

        if ($idempotencyKey === '' || $control === '' || $reference === '' || $amount <= 0 || $method === '') {
            return [
                '_status' => 422,
                'message' => 'idempotencyKey, control, reference, amount y method son obligatorios.',
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
            'id' => uniqid('pay_', true),
            'idempotencyKey' => $idempotencyKey,
            'control' => $control,
            'reference' => $reference,
            'amount' => $amount,
            'method' => $method,
            'status' => 'draft',
            'createdAt' => gmdate(DATE_ATOM),
            'source' => 'sprint-7-scaffold',
        ];

        return [
            'data' => $this->repository->append($record),
            'meta' => ['idempotent' => false],
        ];
    }
}
