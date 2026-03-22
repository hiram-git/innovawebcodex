<?php

use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MetaController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ElectronicDocumentController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProductController;

return [
    ['GET', '/api/health', [HealthController::class, 'show']],
    ['GET', '/api/meta/bootstrap', [MetaController::class, 'bootstrap']],
    ['GET', '/api/v1/customers', [CustomerController::class, 'index']],
    ['GET', '/api/v1/catalog/products', [ProductController::class, 'index']],
    ['GET', '/api/v1/electronic-documents', [ElectronicDocumentController::class, 'index']],
    ['GET', '/api/v1/electronic-documents/detail', [ElectronicDocumentController::class, 'show']],
    ['GET', '/api/v1/payments', [PaymentController::class, 'index']],
    ['POST', '/api/v1/payments', [PaymentController::class, 'store']],
    ['GET', '/api/v1/invoices', [InvoiceController::class, 'index']],
    ['POST', '/api/v1/invoices', [InvoiceController::class, 'store']],
];
