<?php

namespace App\Http\Controllers\Api;

final class MetaController
{
    public function bootstrap(): array
    {
        return [
            'program' => 'innova-modernization',
            'currentSprint' => 'Sprint 10',
            'status' => 'in_progress',
            'completed' => [
                'migration-report',
                'roadmap-by-sprint',
                'api-foundation-scaffold',
                'frontend-shell-scaffold',
                'electronic-dispatch-api',
            ],
            'next' => [
                'auth-foundation',
                'customer-module-api',
                'frontend-api-integration',
                'catalog-module-api',
                'electronic-documents-api',
                'payments-api',
                'invoices-api',
                'provider-adapters-hardening',
            ],
        ];
    }
}
