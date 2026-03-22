# Implementación inicial alineada al roadmap

## Alcance implementado en este cambio

Este cambio materializa la **fundación técnica** de los primeros sprints del roadmap:

- estructura `apps/api-laravel` para la nueva API
- estructura `apps/web` para el nuevo frontend React/Vite
- configuración base para SQL Server (`sqlsrv`) y entorno compatible con Laragon 6.0
- `docker-compose.yml` para levantar carriles iniciales de legacy, API y frontend

## Limitaciones actuales

- No fue posible instalar dependencias desde internet en este entorno, por lo que la estructura creada es una **base compatible** con Laravel/Vite pero sin `vendor/` ni `node_modules/`.
- La API incluye un bootstrap mínimo en PHP para poder validar rutas iniciales mientras se completa la instalación real en un entorno con acceso a paquetes.

## Próximos pasos inmediatos

1. Ejecutar `composer install` dentro de `apps/api-laravel` en Laragon 6.0 o en un entorno con acceso a Packagist.
2. Ejecutar `npm install` dentro de `apps/web`.
3. Reemplazar el bootstrap mínimo por el runtime completo de Laravel 11.
4. Conectar el frontend a la API real y comenzar los módulos de clientes y consulta FE.
