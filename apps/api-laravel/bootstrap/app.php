<?php

require_once __DIR__ . '/../app/Support/helpers.php';
require_once __DIR__ . '/../app/Support/Env.php';
require_once __DIR__ . '/../app/Support/Http/JsonResponse.php';
require_once __DIR__ . '/../app/Contracts/ElectronicInvoiceProviderInterface.php';
require_once __DIR__ . '/../app/Services/ElectronicInvoicing/TheFactoryHkaProvider.php';
require_once __DIR__ . '/../app/Services/ElectronicInvoicing/DigifactProvider.php';
require_once __DIR__ . '/../app/Services/ElectronicInvoicing/ProviderResolver.php';
require_once __DIR__ . '/../app/Repositories/AuthSessionRepository.php';
require_once __DIR__ . '/../app/Repositories/CustomerRepository.php';
require_once __DIR__ . '/../app/Repositories/ProductRepository.php';
require_once __DIR__ . '/../app/Repositories/ElectronicDocumentRepository.php';
require_once __DIR__ . '/../app/Repositories/PaymentAuditRepository.php';
require_once __DIR__ . '/../app/Repositories/InvoiceDraftRepository.php';
require_once __DIR__ . '/../app/Repositories/ElectronicDispatchRepository.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/HealthController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/MetaController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/AuthController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/CustomerController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/ProductController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/ElectronicDocumentController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/PaymentController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/InvoiceController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/V1/ElectronicDispatchController.php';

use App\Support\Http\JsonResponse;

$envPath = __DIR__ . '/../.env';
if (is_file($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    JsonResponse::send(['ok' => true], 204);
    return;
}

$routes = require __DIR__ . '/../routes/api.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

foreach ($routes as [$routeMethod, $routePath, $handler]) {
    if ($routeMethod === $method && $routePath === $path) {
        [$class, $action] = $handler;
        $controller = new $class();
        $response = $controller->$action();
        $status = $response['_status'] ?? 200;
        unset($response['_status']);
        JsonResponse::send($response, $status);
        return;
    }
}

JsonResponse::send(['message' => 'Route not found'], 404);
