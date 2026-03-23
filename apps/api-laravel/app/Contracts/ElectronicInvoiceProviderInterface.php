<?php

namespace App\Contracts;

interface ElectronicInvoiceProviderInterface
{
    public function dispatch(array $payload): array;

    public function supportsDocumentType(string $documentType): bool;

    public function providerName(): string;
}
