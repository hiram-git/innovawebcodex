# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 11**
   - endurecer auth con persistencia/secretos reales y expiración robusta
   - definir permisos por tenant, sucursal y módulo operativo
   - habilitar observabilidad inicial y métricas API por endpoint/evento

2. **Entrar a Sprint 12**
   - preparar shell frontend con login, guards y estado global
   - propagar sesión/tenant del backoffice al cliente HTTP
   - alinear navegación y layout del backoffice nuevo

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en auth scaffold, contratos y frontend base.
- No puedo completar auth productiva ni integración FE/SQL Server real sin registries, drivers, secretos y runtime completo.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 12 y siguientes sobre runtime real.
