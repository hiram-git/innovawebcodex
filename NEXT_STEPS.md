# Siguientes pasos recomendados

## Resolución y continuidad

- **Resolución operativa:** ejecutar **Sprint 21** (sincronización diferida) y preparar cierre hacia Sprint 22.
- **Estado del programa:** ya casi terminamos la fase offline; enfocar cierre en cola local, reintentos y conflictos controlados.

## Qué sigue inmediatamente

1. **Cerrar Sprint 21**
   - validar cola local en operaciones permitidas (facturas/pagos draft)
   - verificar reintentos y limpieza de cola al recuperar conectividad
   - reforzar telemetría y trazabilidad del sync diferido

2. **Entrar a Sprint 22**
   - cerrar límites offline de compliance para FE/cobros/facturas
   - ejecutar pruebas de borde offline/online
   - endurecer observabilidad de degradación y recuperación

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en caché offline controlado, shell frontend y contratos.
- No puedo completar validación offline productiva ni integración FE/SQL Server real sin runtime completo, assets finales y drivers.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 22 y siguientes sobre runtime real.
