# API foundation

## Qué sigue inmediatamente

1. Instalar dependencias reales de Laravel 11 con `composer install`.
2. Sustituir este bootstrap mínimo por el runtime oficial de Laravel.
3. Cerrar Sprint 14 (`electronic documents UI`).
4. Avanzar Sprint 15 (`payments UI`).

## Endpoints disponibles en este scaffold

- `GET /api/health`
- `GET /api/meta/bootstrap`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/session`
- `GET /api/v1/customers`
- `GET /api/v1/catalog/products`
- `GET /api/v1/electronic-documents`
- `GET /api/v1/electronic-documents/detail?control=...`
- `GET /api/v1/electronic-documents/artifact?control=...&type=pdf|xml|qr`
- `GET /api/v1/payments`
- `POST /api/v1/payments`
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/electronic-dispatch`
- `POST /api/v1/electronic-dispatch`
