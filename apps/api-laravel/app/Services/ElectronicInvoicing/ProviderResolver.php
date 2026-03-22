<?php

namespace App\Services\ElectronicInvoicing;

use App\Contracts\ElectronicInvoiceProviderInterface;
use InvalidArgumentException;

final class ProviderResolver
{
    public function resolve(string $provider): ElectronicInvoiceProviderInterface
    {
        return match ($provider) {
            'the-factory-hka' => new TheFactoryHkaProvider(),
            'digifact' => new DigifactProvider(),
            default => throw new InvalidArgumentException('Proveedor FE no soportado.'),
        };
    }
}
