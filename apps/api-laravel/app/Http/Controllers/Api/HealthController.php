<?php

namespace App\Http\Controllers\Api;

use App\Support\Env;

final class HealthController
{
    public function show(): array
    {
        return [
            'status' => 'ok',
            'service' => 'innova-api',
            'time' => gmdate(DATE_ATOM),
            'database' => [
                'driver' => Env::get('DB_CONNECTION', 'sqlsrv'),
                'host' => Env::get('DB_HOST', '127.0.0.1'),
                'database' => Env::get('DB_DATABASE', ''),
            ],
        ];
    }
}
