<?php

namespace App\Http\Controllers\Api;

final class MetaController
{
    public function bootstrap(): array
    {
        return [
            'program' => 'innova-modernization',
            'currentSprint' => 'Sprint 13',
            'status' => 'in_progress',
            'completed' => [
                'migration-report',
                'roadmap-by-sprint',
                'api-foundation-scaffold',
                'frontend-shell-scaffold',
                'electronic-dispatch-api',
                'auth-foundation',
                'frontend-shell-auth-guards',
                'customers-ui-scaffold',
            ],
            'next' => [
                'frontend-api-integration',
                'catalog-module-api',
                'electronic-documents-api',
                'payments-api',
                'invoices-api',
                'provider-adapters-hardening',
                'api-observability',
                'customer-edit-persistence',
            ],
        ];
    }
}
