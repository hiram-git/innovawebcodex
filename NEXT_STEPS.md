# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 8**
   - conectar drafts de factura con SQL Server real
   - mapear impuestos, descuentos y totales del modelo legacy
   - preparar transición hacia emisión FE desde la nueva API

2. **Entrar a Sprint 9**
   - encapsular The Factory HKA en el nuevo backend
   - preparar reenvíos y trazabilidad FE
   - fortalecer auditoría técnica y funcional

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en endpoints base, frontend y contratos de módulos.
- No puedo completar Laravel/Vite reales ni integración transaccional FE/SQL Server sin registries y sin `pdo_sqlsrv`.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 9 y siguientes sobre runtime real.
