# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 14**
   - conectar detalle FE con descargas reales de PDF/XML/QR
   - consolidar filtros, estados y feedback operativo del módulo fiscal
   - preparar trazabilidad visual homogénea para incidentes FE

2. **Entrar a Sprint 15**
   - profundizar flujo frontend de cobros con formularios y métodos de pago
   - unificar componentes reutilizables de tablas, filtros y formularios
   - alinear navegación operativa con el circuito de caja/cobranza

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en shell frontend, módulos UI y contratos.
- No puedo completar descargas productivas ni integración FE/SQL Server real sin drivers, secretos y runtime completo.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 15 y siguientes sobre runtime real.
