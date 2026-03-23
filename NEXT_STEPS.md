# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 13**
   - conectar edición de clientes con persistencia real del backend
   - consolidar búsqueda, paginación y feedback de operaciones
   - preparar integración frontend con catálogos reales relacionados

2. **Entrar a Sprint 14**
   - profundizar consulta FE en frontend con detalle, estados y descargas
   - unificar componentes reutilizables de tablas, filtros y formularios
   - alinear navegación operativa con los módulos fiscales

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en shell frontend, módulos UI y contratos.
- No puedo completar persistencia productiva ni integración FE/SQL Server real sin drivers, secretos y runtime completo.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 14 y siguientes sobre runtime real.
