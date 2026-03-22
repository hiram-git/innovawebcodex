# Análisis del repositorio y propuesta de migración moderna

## 1. Resumen ejecutivo

- El sistema es un monolito PHP procedural con lógica de negocio, acceso a datos, rendering HTML, JavaScript y llamadas a integraciones externas mezcladas dentro de los mismos archivos.
- El flujo principal gira alrededor de clientes, pedidos, presupuestos, facturas, cobros, órdenes de trabajo y facturación electrónica panameña.
- La integración FE está operativa pero fuertemente acoplada a tablas transaccionales (`TRANSACCMAESTRO`, `TRANSACCDETALLES`, `FELINNOVA`, `Documentos`) y a pantallas legacy.
- El riesgo principal de una migración “big bang” es alto; se recomienda una migración gradual con patrón strangler fig y estrategia API-first.

## 2. Estructura del proyecto

### 2.1 Carpetas principales

| Carpeta | Rol observado | Riesgo / comentario |
|---|---|---|
| `/` | Pantallas principales, controladores PHP, lógica transaccional, utilidades y vistas HTML mezcladas | Acoplamiento máximo |
| `ajax/` | Endpoints AJAX ad hoc para consultas y mutaciones | No hay contrato API formal |
| `fel/` | Integraciones de facturación electrónica Panamá | Dominio crítico del negocio |
| `ticket/` | Plantillas/generación de tickets | Acoplado al modelo transaccional actual |
| `config/` | Conexión DB y archivos de configuración | Credenciales hardcoded |
| `css/`, `bootstrap2/`, `jquery/`, `assets/` | Frontend legacy basado en jQuery/Bootstrap/DataTables | Deuda técnica alta |
| `library/`, `dompdf/` | Dependencias embebidas | Gestión de dependencias inconsistente |
| `logs/` | Logs de ejecución | No existe estrategia centralizada |

### 2.2 Archivos núcleo

- `index.php`: login + navegación inicial por `XMLHttpRequest`. 
- `clientes.php`: pantalla hub del negocio desde donde se entra a facturas, cobros y otras tareas.
- `tarea_factura.php`: armado manual de factura y selección de productos.
- `grabar_factura.php`: creación de factura, detalle, pagos y activación de facturación electrónica.
- `lista_cobros.php` y `grabar_cobro.php`: consulta y aplicación de cobros.
- `facturacion_electronica.php`: consola/listado FE.
- `factura_electronica_configuracion.php`: mantenimiento de configuración FE.
- `ajax/*`: endpoints de consulta como formas de pago, listado FE, documentos, órdenes de trabajo y configuración FE.

## 3. Rutas principales y flujos críticos

### 3.1 Flujo de autenticación

1. `index.php` muestra el formulario de login.
2. El login llama por `XMLHttpRequest` a `grabar_login.php` usando parámetros por query string.
3. Si el login es correcto, redirige a `clientes.php?input_buscar=`.

### 3.2 Flujo comercial principal

1. `clientes.php` funciona como tablero/hub.
2. Desde allí se abre `tarea_factura.php`, `tarea_presupuesto.php`, `lista_cobros.php`, `facturacion_electronica.php` y otros módulos.
3. `tarea_factura.php` usa sesión (`$_SESSION['aDatos']`) para acumular productos.
4. El guardado de la transacción se hace en `grabar_factura.php`.
5. Luego se genera impresión/PDF y, si aplica, se emite la FE.

### 3.3 Flujo de facturación electrónica

1. `facturacion_electronica.php` consume `ajax/obtenerConfigFacElec.php` y `ajax/mostrarFel.php`.
2. `grabar_factura.php` valida/crea estructura FE (`FELINNOVA`) y según configuración llama al integrador correspondiente.
3. El proveedor FE consulta `TRANSACCMAESTRO`/`TRANSACCDETALLES`, arma XML o payload, envía al PAC/DGI y persiste respuesta en `Documentos`.
4. La UI consulta `ajax/mostrarDocumento.php` para visualizar resultado / PDF / XML.

### 3.4 Flujo de cobros

1. `lista_cobros.php` lista facturas abiertas y consulta formas de pago por AJAX.
2. El frontend envía el cobro a `grabar_cobro.php`.
3. `grabar_cobro.php` crea un nuevo documento `PAGxFAC` en `TRANSACCMAESTRO` y descuenta saldo a la factura original.

## 4. Hallazgos técnicos y malas prácticas

### 4.1 Acoplamiento fuerte

- La lógica de negocio vive dentro de pantallas PHP, scripts AJAX y archivos de integración FE.
- Los mismos archivos renderizan HTML, ejecutan SQL, transforman datos y llaman servicios externos.
- El estado del carrito/documento depende de `$_SESSION['aDatos']`, lo cual dificulta escalar, probar y exponer API.

### 4.2 Acceso a datos y seguridad

- Hay SQL concatenado con datos de entrada en múltiples flujos críticos.
- Se exponen credenciales de base de datos en `config/db.php`.
- Hay uso de GET para operaciones sensibles como login y grabación de factura.
- Se desactiva verificación SSL en llamadas cURL del proceso de FE.
- No existe capa de validación consistente, rate limiting, auditoría estructurada ni manejo de secretos.

### 4.3 Frontend legacy

- HTML con estilos inline, media queries dispersas y layout basado en tablas/divs simulando tablas.
- Dependencia alta en jQuery, Bootstrap antiguo, DataTables y `XMLHttpRequest` manual.
- No hay SPA ni separación por componentes.
- No se observa implementación robusta de service worker ni estrategia offline real.

### 4.4 Base de datos y evolución de esquema

- Los endpoints FE crean/alteran tablas en runtime (`FELINNOVA`, `Documentos`).
- Se detectan `DROP TABLE` condicionales dentro de endpoints productivos, lo cual es riesgoso.
- El modelo transaccional depende de tablas legacy de alta cardinalidad y columnas históricas.

### 4.5 Observabilidad y testing

- No se encontraron suites de pruebas automatizadas del negocio.
- La trazabilidad se basa principalmente en archivos sueltos y logs locales.
- No hay separación clara entre logs funcionales, técnicos y de compliance.

## 5. Integraciones de facturación electrónica detectadas

### 5.1 Componentes y proveedores identificados

| Integración | Ubicación | Función |
|---|---|---|
| The Factory HKA Panamá | `fel/thfkapanama/` | Emisión FE, construcción de documento electrónico, consulta RUC/DV, PDF/correo |
| Digifact | `fel/digifact/` | Obtención de token, armado XML y envío de documento |
| Configuración FE central | `ajax/guardarFactElecConfig.php`, `ajax/obtenerConfigFacElec.php` | Persistencia de parámetros, PAC, ambiente, credenciales |
| Persistencia de resultado FE | tabla `Documentos`, `ajax/mostrarDocumento.php`, `ajax/mostrarFel.php` | Estado, CUFE/QR, PDF, XML, fechas DGI |

### 5.2 Tipos documentales / capacidades observadas

- Factura electrónica FE.
- Factura de consumo / variantes por tipo de cliente (`Consumidor Final`, `Contribuyente`, `Gobierno`, `Régimen Especial`, etc.).
- Retenciones y casos especiales.
- Cobros ligados a factura (`PAGxFAC`).
- El usuario menciona nota de crédito y nota de débito; el modelo y helpers muestran bases para ampliar esos documentos, pero en este repositorio la evidencia más clara y completa está en facturas/cobros/retenciones. En la migración se debe relevar estos flujos funcionales directamente con negocio y BD antes del corte.

### 5.3 Datos de compliance manejados hoy

- CUFE / URL consulta FE.
- QR.
- Fecha de recepción DGI.
- Número de protocolo de autorización.
- Fecha límite.
- XML/PDF del documento.
- Parámetros fiscales de emisor, sucursal, punto fiscal, ambiente y PAC.

## 6. Recomendación de stack frontend

## Recomendación: React + Vite + TypeScript

### Por qué esta opción es la más adecuada aquí

- El sistema necesita migración progresiva, no reemplazo total inmediato.
- Vite permite construir micro-frontends o islas SPA rápidamente sin el costo operativo de Next.js en un primer tramo.
- React tiene ecosistema muy maduro para PWA, formularios complejos, tablas y componentes accesibles.
- Facilita incrustar el nuevo frontend dentro del monolito mientras coexistenn ambas capas.

### Stack propuesto

| Capa | Recomendación |
|---|---|
| UI | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Componentes | shadcn/ui + Radix UI |
| Routing | React Router 7 |
| Estado | Zustand |
| Formularios | React Hook Form + Zod |
| Data fetching | TanStack Query 5 |
| Tablas | TanStack Table 8 |
| PWA | `vite-plugin-pwa` + Workbox |
| Testing | Vitest + Testing Library + Playwright |

### Implementación PWA real

- `manifest.webmanifest` con nombre corto, iconos, theme color y shortcuts.
- Service worker generado con Workbox.
- Estrategia offline-first para catálogos, clientes recientes, configuración local y cola de acciones.
- Background sync para cobros y documentos no críticos; para FE usar modo “queue + validación humana” por compliance.
- Pantallas installable y fallback offline.

### Principios UX/mobile-first

- Diseño por breakpoints móviles reales, no por “desktop comprimido”.
- Reemplazar tablas fijas por cards, listas virtualizadas y tablas responsivas sólo en desktop.
- Componentes accesibles con focus states, navegación por teclado y contraste AA.

## 7. Recomendación de backend

## Opción A recomendada: Laravel 11

### Motivo

- Permite conservar PHP y reducir el riesgo de negocio.
- El dominio FE ya existe en PHP; moverlo inicialmente a servicios Laravel reduce retrabajo.
- Laravel ofrece colas, jobs, eventos, scheduler, policies, rate limiting, logs, testing y observabilidad de forma estándar.

### Arquitectura sugerida

```text
apps/
  api-laravel/
    app/
      Domain/
        Billing/
        ElectronicInvoicing/
        Customers/
        Payments/
      Application/
        UseCases/
        DTOs/
      Infrastructure/
        Persistence/
        Pac/
        Dgi/
        Signatures/
      Http/
        Controllers/
        Requests/
        Resources/
        Middleware/
```

### Módulos iniciales

1. Auth y tenants/empresa.
2. Clientes.
3. Catálogo de productos.
4. Pedidos/presupuestos.
5. Facturas.
6. Cobros.
7. Facturación electrónica Panamá.
8. Reportes / documentos.

### Contratos API sugeridos

- `POST /api/v1/auth/login`
- `GET /api/v1/customers`
- `POST /api/v1/invoices`
- `POST /api/v1/invoices/{id}/issue-electronic`
- `GET /api/v1/electronic-documents`
- `GET /api/v1/electronic-documents/{id}`
- `POST /api/v1/payments`
- `POST /api/v1/electronic-documents/{id}/retry`

### Integración FE modernizada

Crear un puerto de dominio:

- `ElectronicInvoiceProviderInterface`
  - `issueInvoice()`
  - `issueCreditNote()`
  - `issueDebitNote()`
  - `queryTaxpayer()`
  - `downloadPdf()`
  - `downloadXml()`

Adaptadores:
- `TheFactoryHkaProvider`
- `DigifactProvider`
- futuro `DgiDirectProvider`

### Opción B: NestJS

Sólo la recomendaría si:
- el equipo ya domina TypeScript full-stack,
- existe plan de contratar talento Node/Nest,
- se quiere converger todo el stack a TypeScript.

Para este caso, **no la recomiendo como primera fase** porque incrementa el riesgo sobre un dominio FE ya sensible y hoy implementado en PHP.

## 8. Estrategia de migración gradual (Strangler Fig)

### Principio

No apagar el monolito. Colocar una nueva capa API y UI por encima, encapsulando primero los casos de uso más estables y observables.

### Aplicación práctica

1. Mantener la BD legacy inicialmente.
2. Crear `api-laravel` como backend nuevo.
3. Crear `web-app` React como frontend nuevo.
4. Poner un reverse proxy (Nginx/Traefik):
   - `/legacy/*` → PHP actual.
   - `/api/*` → Laravel.
   - `/app/*` → React.
5. Migrar módulo por módulo.
6. Cuando un módulo quede estable, dejar el legacy sólo en modo consulta o retirarlo.

### Orden recomendado de estrangulamiento

1. Login/autenticación y shell principal.
2. Catálogos de solo lectura.
3. Clientes.
4. Consulta FE/documentos.
5. Cobros.
6. Facturación nueva.
7. Presupuestos/pedidos.
8. Reimpresión/reportes.

## 8.1 Restricciones obligatorias de infraestructura y coexistencia

### Entorno local/operativo requerido

- La implementación y validación inicial deben contemplar **Laragon 6.0** como entorno de desarrollo/soporte operativo, evitando versiones recientes con sistema de anuncios/licenciamiento.
- La base de datos debe mantenerse en **SQL Server** porque coexistirá con un ERP de escritorio hecho en **Clarion**.
- El stack PHP/Apache debe considerar explícitamente la instalación y compatibilidad de las extensiones de **SQL Server para PHP** (`sqlsrv` y `pdo_sqlsrv`).
- Cualquier propuesta de contenedores o cloud debe respetar que el sistema seguirá integrándose con la misma base SQL Server mientras dure la coexistencia.

### Implicaciones arquitectónicas

1. **No** recomiendo migrar la base de datos en las primeras fases.
2. Laravel 11 debe configurarse desde el inicio con driver `sqlsrv` y pruebas de compatibilidad sobre SQL Server real.
3. El monolito legacy, Laravel nuevo y ERP Clarion deben operar sobre un modelo de convivencia controlada con tablas compartidas o vistas de integración versionadas.
4. El plan de despliegue debe contemplar dos carriles:
   - **Carril operativo Windows/Laragon 6.0** para soporte local y continuidad.
   - **Carril Docker/Compose** para estandarización, integración continua y futuros ambientes reproducibles.
5. Las migraciones de esquema deben pasar por gobernanza estricta, porque cualquier cambio impacta tanto a la web legacy como al ERP de escritorio.

### Recomendación práctica para Laragon 6.0

- PHP 8.3 compatible con `sqlsrv`/`pdo_sqlsrv`.
- Apache habilitado con las DLL/extensiones correctas de SQL Server.
- Validación de conexión con `sqlsrv` y PDO antes de mover módulos críticos.
- Script de bootstrap del entorno con checklist de extensiones, `php.ini`, `httpd.conf` y variables de entorno.

## 9. Plan por fases con esfuerzo aproximado

| Fase | Objetivo | Entregables | Esfuerzo estimado |
|---|---|---|---|
| 1 | Análisis y setup | ADRs, mapa de tablas, Docker, CI/CD base, Laravel + React bootstrap | 3-5 semanas |
| 2 | Backend API-first | Auth, clientes, catálogos, invoices/payments API, adapter FE inicial | 6-10 semanas |
| 3 | Frontend nuevo | Shell SPA/PWA, login, clientes, facturas, cobros, consulta FE | 8-12 semanas |
| 4 | PWA/offline | SW, caché, sincronización diferida, instalación, modo degradado | 3-5 semanas |
| 5 | Testing, seguridad y despliegue | QA integral, hardening, observabilidad, runbooks, cutover gradual | 4-6 semanas |

### Estimación total realista

- **24 a 38 semanas** para una migración seria con continuidad operativa.
- Si hay poco conocimiento funcional documentado de FE/DGI, añadir 3-6 semanas de discovery.
- Si además se debe certificar compatibilidad en Laragon 6.0 + SQL Server + coexistencia con Clarion, añadir 1-3 semanas de hardening técnico inicial.

## 9.1 Plan por fases detallado y accionable

### Fase 1 — Análisis, arquitectura base y setup

**Objetivo**
Dejar preparado el terreno técnico y funcional para que la migración empiece sin romper la operación actual.

**Actividades principales**
1. Levantamiento funcional de módulos: clientes, pedidos, presupuestos, facturas, cobros, FE, reportes y seguridad.
2. Inventario de tablas, SPs, vistas y dependencias con ERP Clarion sobre SQL Server.
3. Instalación y validación de entorno **Laragon 6.0 + Apache + PHP + SQL Server extensions**.
4. Bootstrap del nuevo backend Laravel 11 con conexión `sqlsrv`.
5. Bootstrap del nuevo frontend React + Vite + TypeScript + Tailwind.
6. Definición de ADRs: autenticación, tenancy, estrategia API, FE adapters, logs, colas y despliegue.
7. Montaje inicial de Docker Compose para ambientes reproducibles.

**Entregables**
- Mapa funcional y técnico validado.
- Matriz de tablas críticas y dueños funcionales.
- Nuevo repositorio o estructura `apps/api-laravel` y `apps/web`.
- Documento de arquitectura base y estándares de desarrollo.
- Checklist operativo de Laragon 6.0 y SQL Server.

**Riesgos**
- Dependencias ocultas del ERP Clarion.
- Inconsistencias de esquema en SQL Server.
- Falta de casos reales documentados para FE.

**Criterio de salida**
- El equipo puede levantar el stack nuevo en Laragon 6.0 y en Docker.
- Laravel conecta correctamente a SQL Server.
- Existe backlog priorizado y mapa de dependencias aprobado.

### Fase 2 — Migración progresiva del backend (API-first)

**Objetivo**
Construir el nuevo backend desacoplando casos de uso del monolito y dejando APIs consumibles por frontend nuevo y legacy.

**Actividades principales**
1. Implementar autenticación y autorización centralizada.
2. Crear módulos API para clientes, productos, catálogos y documentos de consulta.
3. Extraer el dominio de facturas y cobros a servicios Laravel.
4. Encapsular FE en adaptadores: The Factory HKA y Digifact.
5. Crear jobs/colas para emisión FE, reintentos y descarga de PDF/XML.
6. Agregar validación de requests, logging estructurado y auditoría.
7. Exponer endpoints idempotentes para emisión y reenvío de FE.

**Entregables**
- API v1 autenticada.
- Módulos `customers`, `catalog`, `invoices`, `payments`, `electronic-documents`.
- FE adapter layer y pruebas de caracterización mínimas.
- OpenAPI/Swagger interno.

**Riesgos**
- Reglas fiscales embebidas en scripts legacy.
- Campos legacy con semántica difusa en `TRANSACCMAESTRO`.
- Problemas de concurrencia al coexistir Laravel + monolito + Clarion.

**Criterio de salida**
- Nuevos endpoints cubren al menos consultas de clientes, listado FE, cobros y creación de factura en ambiente controlado.
- Las emisiones FE de prueba devuelven trazabilidad completa.

### Fase 3 — Migración del frontend usando el nuevo API

**Objetivo**
Sustituir gradualmente las pantallas legacy más críticas por una UI moderna, mobile-first y desacoplada del backend procedural.

**Actividades principales**
1. Construir shell de aplicación, login y navegación principal.
2. Migrar módulo de clientes y búsqueda.
3. Migrar listado/consulta de FE.
4. Migrar facturación y cobros contra la nueva API.
5. Implementar componentes reutilizables, formularios tipados y manejo de estado.
6. Dejar fallback temporal a pantallas legacy donde aún no se haya migrado el flujo.

**Entregables**
- Web app React productiva para módulos priorizados.
- Design system base con Tailwind + componentes accesibles.
- Integración con API Laravel y feature flags de convivencia.

**Riesgos**
- Diferencias de comportamiento entre frontend legacy y nuevo.
- Casos de negocio no documentados en formularios complejos.

**Criterio de salida**
- Usuarios piloto pueden operar clientes, consulta FE y al menos un flujo completo de facturación/cobro desde la nueva UI.

### Fase 4 — Implementación completa de PWA + offline

**Objetivo**
Agregar capacidades reales de PWA y operación degradada sin comprometer compliance fiscal.

**Actividades principales**
1. Configurar `manifest.webmanifest` y service worker con Workbox.
2. Cachear assets, catálogos y consultas seguras de lectura.
3. Implementar storage local cifrado para datos no sensibles.
4. Crear cola offline para acciones permitidas.
5. Definir qué operaciones pueden trabajar offline y cuáles deben permanecer online por compliance.
6. Implementar reintento/sync diferido y manejo de conflictos.

**Entregables**
- PWA instalable.
- Estrategia offline documentada por caso de uso.
- Cola de sincronización y pantallas de estado.

**Riesgos**
- Intentar operar FE offline sin garantías de compliance.
- Conflictos de sincronización en cobros/facturas.

**Criterio de salida**
- La app funciona instalada y soporta lectura offline y sincronización segura en los casos permitidos.

### Fase 5 — Testing, seguridad, hardening y despliegue

**Objetivo**
Cerrar brechas de calidad, seguridad y operación para llevar la migración a producción por etapas.

**Actividades principales**
1. Pruebas unitarias, integración, E2E y caracterización FE.
2. Hardening de headers, CSP, rate limiting, JWT/refresh, secretos y auditoría.
3. Observabilidad: logs estructurados, métricas, alertas y tracing.
4. Plan de rollout gradual con feature flags y reversa controlada.
5. Runbooks operativos para FE rechazada, reintentos, incidentes SQL Server y fallback a legacy.
6. Capacitación a soporte y usuarios clave.

**Entregables**
- Suite mínima de pruebas automatizadas.
- Runbooks de operación y contingencia.
- Pipeline CI/CD y estrategia de despliegue aprobada.

**Riesgos**
- Subestimar validaciones fiscales y operativas.
- Observabilidad insuficiente durante coexistencia.

**Criterio de salida**
- Go-live parcial con monitoreo, rollback definido y aceptación de usuarios clave.

### Orden recomendado de implementación real

1. Clientes y catálogos.
2. Consulta/listado de FE.
3. Cobros.
4. Facturación.
5. Reimpresión/reportes.
6. Presupuestos/pedidos.

### Equipo sugerido por fase

| Rol | Dedicación sugerida |
|---|---|
| Líder técnico / arquitecto | 1 |
| Backend Laravel | 2 |
| Frontend React | 2 |
| QA | 1 |
| DevOps / Infra | 0.5-1 |
| Analista funcional con conocimiento FE/DGI | 1 |

### Dependencias críticas transversales

- Acceso a SQL Server de integración.
- Casos reales anonimizados de facturación electrónica.
- Validación funcional de coexistencia con Clarion.
- Ambiente Laragon 6.0 homologado.

## 9.2 Roadmap por sprints para cada fase

> Supuesto base: sprints de **2 semanas** con demo funcional, retrospectiva y refinamiento al cierre.

### Fase 1 — Roadmap por sprints

| Sprint | Objetivo | Tareas clave | Resultado esperado |
|---|---|---|---|
| Sprint 1 | Discovery funcional y técnico | relevamiento de módulos, mapa de rutas actuales, inventario de tablas críticas, identificación de dependencias con Clarion | baseline funcional/técnico aprobado |
| Sprint 2 | Setup de entornos | homologar Laragon 6.0, validar `sqlsrv`/`pdo_sqlsrv`, bootstrap Laravel 11 y React/Vite, configurar repositorio y estándares | entornos operativos y checklist técnico cerrados |
| Sprint 3 | Arquitectura base | ADRs, estrategia auth, tenancy, logging, colas, FE adapters, docker compose inicial, backlog priorizado | arquitectura objetivo y backlog fase 2 listos |

### Fase 2 — Roadmap por sprints

| Sprint | Objetivo | Tareas clave | Resultado esperado |
|---|---|---|---|
| Sprint 4 | Fundación API | auth base, usuarios/roles, estructura modular Laravel, health checks, conexión SQL Server, logging | API base operativa |
| Sprint 5 | Catálogos y clientes | endpoints de clientes, productos, catálogos, validaciones, recursos/API responses | consultas maestras consumibles por frontend |
| Sprint 6 | Documentos y consulta FE | listado de documentos, detalle FE, acceso a PDF/XML, auditoría básica | consulta FE desacoplada del monolito |
| Sprint 7 | Cobros | API de pagos/cobros, reglas de negocio, idempotencia, trazabilidad | flujo de cobro disponible en API |
| Sprint 8 | Facturación | creación de facturas, detalle, validaciones, persistencia transaccional, manejo de errores | emisión de factura no-FE desde Laravel |
| Sprint 9 | FE adapters I | encapsular The Factory HKA, pruebas de caracterización, persistencia de request/response | adapter FE 1 estable |
| Sprint 10 | FE adapters II | encapsular Digifact, jobs/colas, reintentos, descarga de PDF/XML | adapter FE 2 estable |
| Sprint 11 | Hardening API | rate limiting, auditoría avanzada, OpenAPI interna, observabilidad inicial | backend listo para piloto frontend |

### Fase 3 — Roadmap por sprints

| Sprint | Objetivo | Tareas clave | Resultado esperado |
|---|---|---|---|
| Sprint 12 | Shell frontend | login, layout, navegación, guards, configuración de estado global y cliente HTTP | base de app React operativa |
| Sprint 13 | Clientes | búsqueda, listado, detalle y edición de clientes, componentes reutilizables | módulo clientes usable |
| Sprint 14 | Consulta FE | listado FE, detalle, estados, descarga/visualización PDF/XML | módulo FE usable desde UI nueva |
| Sprint 15 | Cobros | formularios de cobro, métodos de pago, validaciones, feedback de operación | flujo de cobros usable |
| Sprint 16 | Facturación I | armado de factura, selección de productos, cálculo de impuestos/descuentos | flujo de factura parcial usable |
| Sprint 17 | Facturación II | confirmación, emisión, manejo de errores FE, feature flags y fallback legacy | flujo completo facturación piloto |
| Sprint 18 | UX hardening | mobile-first, accesibilidad, performance, QA visual, ajustes por feedback de usuarios | frontend listo para piloto ampliado |

### Fase 4 — Roadmap por sprints

| Sprint | Objetivo | Tareas clave | Resultado esperado |
|---|---|---|---|
| Sprint 19 | PWA base | manifest, íconos, installability, service worker inicial | app instalable |
| Sprint 20 | Caché y lectura offline | cache de assets, catálogos y consultas permitidas, pantallas offline | modo lectura offline funcional |
| Sprint 21 | Sync diferido | cola local, reintentos, resolución de conflictos en operaciones permitidas | sincronización controlada disponible |
| Sprint 22 | Hardening offline/compliance | definición final de límites offline para FE/cobros/facturas, pruebas de borde y observabilidad | estrategia offline aprobada por negocio y compliance |

### Fase 5 — Roadmap por sprints

| Sprint | Objetivo | Tareas clave | Resultado esperado |
|---|---|---|---|
| Sprint 23 | Testing integral | pruebas unitarias, integración, E2E, caracterización FE | baseline de calidad automatizada |
| Sprint 24 | Seguridad y observabilidad | CSP, JWT/refresh, secretos, métricas, alertas, tracing, auditoría | plataforma endurecida |
| Sprint 25 | UAT y rollout controlado | pilotos, correcciones, feature flags, capacitación, runbooks, rollback | go-live parcial controlado |
| Sprint 26 | Despliegue ampliado y estabilización | ampliación gradual de usuarios/sucursales, soporte post-release, cierre de hallazgos | fase productiva estabilizada |

### Hitos de control recomendados

- **Hito A:** cierre de Sprint 3 → arquitectura y entorno listos.
- **Hito B:** cierre de Sprint 11 → backend API-first listo para consumo real.
- **Hito C:** cierre de Sprint 18 → frontend nuevo listo para piloto funcional.
- **Hito D:** cierre de Sprint 22 → PWA/offline validado con límites de compliance.
- **Hito E:** cierre de Sprint 26 → operación estabilizada y migración avanzada.

### Ruta crítica del roadmap

1. Homologación de Laragon 6.0 + SQL Server extensions.
2. Comprensión exacta de reglas FE y coexistencia con Clarion.
3. API de clientes/catálogos.
4. API de cobros/facturación.
5. Adaptadores FE con pruebas de caracterización.
6. UI nueva sobre API estable.
7. Hardening, UAT y rollout controlado.

## 10. Cumplimiento DGI y manejo seguro de facturación electrónica

### Reglas de migración sin romper compliance

1. No reescribir primero la lógica fiscal; primero encapsularla.
2. Congelar contratos de entrada/salida del motor FE actual.
3. Crear tests de caracterización con facturas reales anonimizadas.
4. Persistir request/response canónicos, XML firmado, hash, CUFE, timestamps y actor.
5. Implementar idempotencia por `control`, `numref` y `tipo_documento`.
6. Tener reintentos controlados y trazables, nunca reenvíos silenciosos.
7. Separar ambientes sandbox y producción con secretos distintos.
8. Versionar catálogos fiscales y reglas tributarias.
9. Mantener bitácora auditable de cada evento FE.

### Arquitectura sugerida del subdominio FE

- `ElectronicDocumentAggregate`
- `TaxpayerLookupService`
- `XmlBuilderService`
- `SignatureService`
- `SubmissionService`
- `DgiResponseParser`
- `FiscalAuditTrailRepository`

## 11. Seguridad recomendada 2025-2026

- OAuth2/JWT de acceso corto + refresh tokens rotados.
- MFA opcional para perfiles administrativos.
- Rate limiting por IP, usuario y empresa.
- CSRF para zonas híbridas web.
- Content Security Policy estricta.
- Secrets en Vault / AWS Secrets Manager / Doppler / 1Password Secrets Automation.
- TLS moderno, HSTS, cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`.
- Sanitización y validación con Form Requests + Zod.
- Auditoría de acciones críticas: login, emisión FE, reenvío FE, cambios de configuración, cobros.
- Cifrado de credenciales PAC/DGI en reposo.
- SAST/DAST y análisis de dependencias en CI.

## 12. Tecnologías recomendadas 2025-2026

### Plataforma

| Área | Recomendación |
|---|---|
| Contenedores | Docker 27+ |
| Orquestación local | Docker Compose v2 |
| Reverse proxy | Traefik 3 o Nginx |
| Backend | PHP 8.3 + Laravel 11 |
| Frontend | Node.js 22 LTS + React 19 + Vite 6 |
| DB principal | SQL Server on-premise/ERP compartido; debe mantenerse por coexistencia con ERP Clarion |
| Cache/colas | Redis 7 |
| Jobs | Laravel Queue + Horizon |
| Archivos | S3 compatible (MinIO en local) |
| Observabilidad | OpenTelemetry + Loki + Prometheus + Grafana + Sentry |
| CI/CD | GitHub Actions / GitLab CI |

### Dependencias sugeridas

#### Backend Laravel

- PHP `8.3`
- Laravel `11.x`
- Laravel Sanctum `4.x` o Passport `12.x`
- Spatie Laravel Data `4.x`
- Spatie Laravel Permission `6.x`
- Laravel Pint `1.x`
- Pest `3.x`
- PHPStan `2.x`
- Monolog `3.x`
- Guzzle `7.9+`
- League Flysystem `3.x`
- Redis extension / predis `2.x`

#### Frontend

- React `19.x`
- TypeScript `5.8+`
- Vite `6.x`
- Tailwind CSS `4.x`
- React Router `7.x`
- Zustand `5.x`
- TanStack Query `5.x`
- TanStack Table `8.x`
- React Hook Form `7.x`
- Zod `3.x`
- Vitest `3.x`
- Playwright `1.52+`
- `vite-plugin-pwa` `0.21+`

## 13. Diseño de despliegue con Docker Compose y coexistencia Windows

### Servicios mínimos

- `legacy-php` (Apache o PHP-FPM + Nginx)
- `api-laravel`
- `web-react`
- `redis`
- `minio`
- `nginx` o `traefik`
- conexión a `sqlserver` externo compartido con Clarion; opcionalmente `sqlserver` local sólo para desarrollo si licenciamiento lo permite

### Topología ejemplo

- `/legacy` → monolito existente en PHP/Apache.
- `/api` → Laravel.
- `/app` → React.
- workers Laravel separados para FE y tareas asíncronas.
- SQL Server permanece como sistema de registro compartido con ERP Clarion.

### Estrategia específica de coexistencia

- Mantener un perfil de ejecución **Windows + Laragon 6.0 + Apache + PHP + SQL Server extensions** para soporte y operación heredada.
- Mantener en paralelo un perfil **Docker Compose** para reproducibilidad, QA y evolución del nuevo stack.
- Documentar diferencias entre ambos perfiles para evitar “works on my machine”.

## 14. Mejoras de negocio recomendadas

1. Push notifications para estados FE, cobros y documentos rechazados.
2. Sincronización offline para vendedores de campo.
3. Multiempresa / multitenancy con aislamiento lógico por `parcontrol`/tenant.
4. Dashboard operativo: emisión por sucursal, rechazos DGI, cobranzas pendientes.
5. Reintentos FE asistidos con cola de incidentes.
6. Firma y trazabilidad documental centralizada.
7. Historial del cliente 360°: pedidos, facturas, cobros, FE, contacto.
8. Catálogo fiscal configurable por empresa/sucursal.
9. Modo contingencia documentado.

## 15. Conclusión ejecutiva

La mejor ruta es **mantener PHP en backend migrando a Laravel 11** y **reconstruir el frontend en React + Vite + TypeScript** con PWA real. El dominio de facturación electrónica debe moverse primero a servicios encapsulados, no reescribirse de golpe. El éxito depende de una migración por fases, con pruebas de caracterización, idempotencia, auditoría y coexistencia controlada entre monolito y plataforma nueva.
