<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\ElectronicDispatchRepository;
use App\Repositories\InvoiceDraftRepository;
use App\Services\ElectronicInvoicing\ProviderResolver;
use InvalidArgumentException;

final class ElectronicDispatchController
{
    public function __construct(
        private readonly ElectronicDispatchRepository $repository = new ElectronicDispatchRepository(),
        private readonly InvoiceDraftRepository $invoiceRepository = new InvoiceDraftRepository(),
        private readonly ProviderResolver $resolver = new ProviderResolver(),
    ) {
    }

    public function index(): array
    {
        $limit = (int) ($_GET['limit'] ?? 20);

        return [
            'data' => $this->repository->all($limit),
            'meta' => [
                'limit' => $limit,
                'providers' => $this->resolver->availableProviders(),
            ],
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
        $provider = trim((string) ($payload['provider'] ?? ''));
        $invoiceId = trim((string) ($payload['invoiceId'] ?? ''));
        $documentType = trim((string) ($payload['documentType'] ?? '01'));
        $retryFromDispatchId = trim((string) ($payload['retryFromDispatchId'] ?? ''));

        if ($idempotencyKey === '' || $provider === '' || $invoiceId === '') {
            return [
                '_status' => 422,
                'message' => 'idempotencyKey, provider e invoiceId son obligatorios.',
            ];
        }

        $existing = $this->repository->findByIdempotencyKey($idempotencyKey);
        if ($existing) {
            return [
                'data' => $existing,
                'meta' => ['idempotent' => true],
            ];
        }

        $invoiceDraft = $this->invoiceRepository->findById($invoiceId);
        if (!$invoiceDraft) {
            return [
                '_status' => 404,
                'message' => 'No existe un invoice draft para el invoiceId indicado.',
            ];
        }

        $retrySource = $retryFromDispatchId !== '' ? $this->repository->findById($retryFromDispatchId) : null;

        try {
            $adapter = $this->resolver->resolve($provider);
        } catch (InvalidArgumentException $exception) {
            return [
                '_status' => 422,
                'message' => $exception->getMessage(),
            ];
        }

        if (!$adapter->supportsDocumentType($documentType)) {
            return [
                '_status' => 422,
                'message' => 'El proveedor FE no soporta el tipo de documento solicitado.',
            ];
        }

        $trace = [
            'requestedAt' => gmdate(DATE_ATOM),
            'channel' => 'api',
            'idempotencyKey' => $idempotencyKey,
            'provider' => $adapter->providerName(),
            'invoiceStatus' => $invoiceDraft['status'] ?? 'draft',
            'source' => 'sprint-10-hardening',
            'retryFromDispatchId' => $retrySource['id'] ?? null,
            'attempt' => $retrySource ? (($retrySource['trace']['attempt'] ?? 1) + 1) : 1,
        ];

        $adapterResponse = $adapter->dispatch([
            'invoice' => $invoiceDraft,
            'documentType' => $documentType,
            'trace' => $trace,
        ]);

        $record = [
            'id' => uniqid('fed_', true),
            'idempotencyKey' => $idempotencyKey,
            'provider' => $provider,
            'invoiceId' => $invoiceId,
            'documentType' => $documentType,
            'status' => $adapterResponse['status'] ?? 'queued',
            'message' => $adapterResponse['message'] ?? '',
            'invoiceSnapshot' => [
                'customerCode' => $invoiceDraft['customerCode'] ?? null,
                'customerName' => $invoiceDraft['customerName'] ?? null,
                'currency' => $invoiceDraft['currency'] ?? null,
                'subtotal' => $invoiceDraft['subtotal'] ?? 0,
                'itemsCount' => count($invoiceDraft['items'] ?? []),
            ],
            'request' => $adapterResponse['request'] ?? [],
            'response' => $adapterResponse['response'] ?? [],
            'correlation' => $adapterResponse['correlation'] ?? [],
            'capabilities' => $adapterResponse['capabilities'] ?? [],
            'technical' => $adapterResponse['technical'] ?? [],
            'trace' => $trace,
            'createdAt' => gmdate(DATE_ATOM),
            'source' => 'sprint-10-hardening',
        ];

        return [
            'data' => $this->repository->append($record),
            'meta' => [
                'idempotent' => false,
                'retry' => $retrySource !== null,
            ],
        ];
    }
}
