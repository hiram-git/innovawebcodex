<?php

namespace App\Http\Controllers\Api;

final class MetaController
{
    public function bootstrap(): array
    {
        return [
            'program' => 'innova-modernization',
            'currentSprint' => 'Sprint 20',
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
                'pwa-base-scaffold',
                'offline-cache-scaffold',
            ],
            'next' => [
                'frontend-api-integration',
                'catalog-module-api',
                'payments-api',
                'invoices-api',
                'provider-adapters-hardening',
                'api-observability',
                'document-download-runtime',
                'sync-deferred-strategy',
                'offline-compliance-hardening',
            ],
        ];
    }
}
