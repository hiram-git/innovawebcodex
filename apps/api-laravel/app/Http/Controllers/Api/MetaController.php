<?php

namespace App\Http\Controllers\Api;

final class MetaController
{
    public function bootstrap(): array
    {
        return [
            'program' => 'innova-modernization',
            'currentSprint' => 'Sprint 14',
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
                'electronic-documents-ui-scaffold',
            ],
            'next' => [
                'frontend-api-integration',
                'catalog-module-api',
                'payments-api',
                'invoices-api',
                'provider-adapters-hardening',
                'api-observability',
                'customer-edit-persistence',
                'document-download-runtime',
            ],
        ];
    }
}
