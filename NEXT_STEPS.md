# Siguientes pasos recomendados

## Resolución y continuidad

- **Resolución operativa:** seguir con el **Sprint 21** (sincronización diferida).
- **Estado del programa:** ya casi terminamos la fase offline; enfocar cierre en cola local, reintentos y conflictos controlados.

## Qué sigue inmediatamente

1. **Cerrar Sprint 20**
   - validar expiración y refresh de caché para assets y lecturas permitidas
   - probar fallback offline del shell y navegación degradada
   - documentar límites operativos offline para módulos fiscales, cobros y facturas

2. **Entrar a Sprint 21**
   - diseñar cola local para operaciones permitidas
   - definir reintentos y resolución de conflictos básica
   - preparar telemetría de sincronización diferida

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en caché offline controlado, shell frontend y contratos.
- No puedo completar validación offline productiva ni integración FE/SQL Server real sin runtime completo, assets finales y drivers.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 21 y siguientes sobre runtime real.
