# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 10**
   - conectar adapters FE con credenciales/configuración reales por ambiente
   - mapear request/response finales con PAC y contingencias
   - consolidar correlación fiscal por control/cufe/providerReference

2. **Entrar a Sprint 11**
   - preparar auth foundation para backoffice y APIs internas
   - definir tenants, sesiones y permisos operativos mínimos
   - habilitar observabilidad y métricas por módulo

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en adapters, contratos y frontend scaffold.
- No puedo completar Laravel/Vite reales ni integración FE productiva sin registries, drivers y credenciales PAC reales.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 11 y siguientes sobre runtime real.
