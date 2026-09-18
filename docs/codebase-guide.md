# Guía para leer el código

Esta guía es el índice del código propio de Catálogo de Aves. Los directorios `vendor/`, los archivos estándar generados por Laravel y las dependencias de `node_modules/` no contienen reglas del producto; se conservan con su documentación oficial.

## Frontend: `apps/web/src/app`

| Ubicación | Responsabilidad |
| --- | --- |
| `app.routes.ts` | Composición de navegación y carga diferida por feature. Los guardas sólo mejoran UX; el backend decide autorización. |
| `app.component.*` | Marco visible: navegación y cierre de sesión local. |
| `core/session.service.ts` | Estado de sesión efímero y persistencia en `sessionStorage`. |
| `core/auth.guard.ts` | Redirige anónimos a `/ingresar` con el destino original. |
| `core/auth.interceptor.ts` | Adjunta `Authorization: Bearer` a peticiones HTTP cuando existe access token. |
| `core/api/*-api.service.ts` | Adaptadores HTTP por contexto. No almacenan sesión ni incorporan lógica de pantalla. |
| `core/location-search.service.ts` | Adaptador de búsqueda explícita de lugares. Limita y cachea Nominatim; es el punto para sustituir el proveedor. |
| `core/runtime-config.ts` y `public/catalogo-aves-runtime-config.json` | Contrato y configuración pública de despliegue; permite cambiar la URL de búsqueda sin recompilar la SPA. |
| `shared/models/*.ts` | Contratos TypeScript de las respuestas REST. |
| `shared/open-street-map.component.*` | Adaptador visual Leaflet/OpenStreetMap; en modo `picker` busca o emite una ubicación privada y en `browse` pinta sólo puntos públicos. |
| `shared/models/location.models.ts` | Contratos de una ubicación elegida visualmente y de los resultados de búsqueda. |
| `features/accounts` | Registro, login y perfil. |
| `features/catalog` | Consulta de especies, filtros y detalle editorial. |
| `features/observations` | Creación, lista privada y mapa público de avistamientos. |
| `features/community` | Feed y notificaciones del usuario autenticado. |
| `features/discovery`, `planning`, `tools` | Páginas de exploración y capacidades de producto en construcción. |
| `features/shared/seed-species.ts` | Fallback visual de desarrollo; Catalog sigue siendo la fuente de verdad. |

Cada `*.page.ts` contiene estado y eventos de una pantalla, mientras que su `*.page.html` se limita a presentación y bindings. Los comentarios de las clases explican el límite de cada pantalla; los métodos públicos documentan entradas, efectos y errores cuando no son obvios.

## Backend: patrón común

Todos los servicios siguen la misma dirección de dependencias:

```text
routes/api.php -> Controller -> Request / Domain service -> Model o DB
                                  |-> Resource (proyección de respuesta)
                                  `-> Cliente HTTP (sólo si otro contexto es dueño del dato)
```

`CorrelationId` adjunta `X-Request-Id` para rastrear una petición. `AuthenticateJwt` valida tokens firmados por Accounts y añade `identity` al request; nunca consulta Accounts ni emite tokens. Las rutas indican qué endpoints son públicos, autenticados o limitados por tasa.

## Accounts

| Archivo | Responsabilidad |
| --- | --- |
| `app/Models/User.php` | Usuario, roles y permisos derivados. |
| `app/Services/JwtService.php` | Único emisor de access tokens RSA. |
| `app/Http/Controllers/AuthController.php` | Registro, login, rotación y revocación de refresh tokens. Guarda únicamente hashes. |
| `app/Http/Controllers/ProfileController.php` | Lectura y actualización del perfil del sujeto autenticado. |
| `app/Console/Commands/EnsureJwtKeys.php` | Crea o valida el par RSA local; la privada nunca se distribuye. |
| `database/seeders/DatabaseSeeder.php` | Datos repetibles de desarrollo y superadministrador sólo en `local`. |

## Catalog

`Species` es la fuente de verdad editorial. `SpeciesController` publica la consulta y restringe la edición a roles emitidos por Accounts. El campo `sensitivity` (`EXACT`, `APPROXIMATE`, `HIDDEN`) es un contrato de conservación consumido por Observation.

## Observation

| Archivo | Responsabilidad |
| --- | --- |
| `CreateSighting` | Caso de uso que decide borrador/publicación y coordina la sensibilidad. |
| `CatalogSensitivityClient` | Capa anticorrupción HTTP de sólo lectura contra Catalog. |
| `LocationPrivacy` | Calcula una proyección pública persistida; nunca calcula una ubicación privada para una respuesta. |
| `SightingResource` | Impide que mapas públicos serialicen coordenadas privadas. |
| `StoreSightingRequest` | Valida la forma HTTP, no las políticas de publicación. |

## Community

`CommunityController` mantiene publicaciones, comentarios, reacciones, seguimientos, reportes, auditoría y notificaciones en su propia base. Las referencias a especies, rutas o avistamientos son identificadores opacos: Community no hace joins ni modificaciones en otros contextos.

## Persistencia y pruebas

Las migrations describen el esquema que cada servicio posee. Los ULID que apuntan a otro contexto son valores sin foreign key. Los seeders son datos locales repetibles y no una estrategia de carga de producción. Las pruebas de `tests/Unit` validan reglas puras; las `Feature` comprueban el bootstrap HTTP de Laravel.

Los binarios de multimedia no pertenecen a las tablas: cada servicio tiene un disco privado `media` en `storage/app/private/media`. La asignación de directorios, persistencia Docker y reglas para cargas futuras está en [media-storage.md](media-storage.md).

Al modificar una ruta, actualización de modelo o variable de entorno, actualiza a la vez el contrato OpenAPI en `contracts/openapi/`, esta guía si cambia una responsabilidad y la prueba que protege el comportamiento.
