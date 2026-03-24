# Siguientes pasos recomendados

## Qué sigue inmediatamente

1. **Cerrar Sprint 19**
   - validar instalación PWA en navegadores objetivo y dispositivos operativos
   - consolidar assets, manifest y comportamiento base del service worker
   - alinear experiencia de instalación con el backoffice y branding operativo

2. **Entrar a Sprint 20**
   - definir caché segura para assets, catálogos y lecturas permitidas
   - preparar pantallas offline y mensajes de degradación controlada
   - documentar límites offline para módulos fiscales y de cobranza

3. **Preparar piloto técnico**
   - levantar SQL Server accesible desde el nuevo backend
   - instalar `pdo_sqlsrv` / `sqlsrv`
   - validar coexistencia con el ERP Clarion

## ¿Se puede continuar en este entorno?

Sí, **parcialmente**:

- Sí puedo seguir avanzando en PWA base, shell frontend y contratos.
- No puedo completar validación PWA productiva ni integración FE/SQL Server real sin runtime completo, assets finales y drivers.
- En cuanto exista acceso a paquetes o drivers preinstalados, puedo seguir con Sprint 20 y siguientes sobre runtime real.
