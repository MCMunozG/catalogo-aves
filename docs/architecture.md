# Arquitectura de Catálogo de Aves

## Propósito y límites

Catálogo de Aves es una plataforma de ciencia ciudadana donde el avistamiento es el dato principal. La arquitectura protege dos propiedades antes que la conveniencia de una pantalla: cada dominio tiene una única fuente de verdad y una ubicación sensible nunca se expone por accidente.

```text
                    Angular SPA
                         |
       /api/accounts ----+----> Accounts      : identidad y sesión
       /api/catalog -----+----> Catalog       : especies y sensibilidad
       /api/observations-+----> Observation   : avistamientos y geoprivacidad
       /api/community ---+----> Community     : conversación y moderación

Observation -- REST (sólo al publicar una especie) --> Catalog
```

Nginx en Docker y el proxy de Angular en desarrollo únicamente encaminan peticiones por prefijo; no contienen reglas de negocio. Cada servicio Laravel se ejecuta y despliega de forma independiente, con una base MySQL lógica propia.

| Componente  | Dueño de                                     | Puerto local | Base lógica         |
| ----------- | -------------------------------------------- | -----------: | ------------------- |
| `apps/web`  | experiencia de usuario y composición de APIs |         4200 | —                   |
| Accounts    | usuarios, perfiles, roles y refresh tokens   |         8001 | `catalogo_aves_accounts`    |
| Catalog     | especies y sensibilidad editorial            |         8002 | `catalogo_aves_catalog`     |
| Observation | avistamientos y proyecciones geográficas     |         8003 | `catalogo_aves_observation` |
| Community   | posts, comentarios, reportes y auditoría     |         8004 | `catalogo_aves_community`   |

La matriz completa de propiedad y operaciones prohibidas está en [service-boundaries.md](service-boundaries.md).

## Frontend

Angular usa componentes standalone y rutas `loadComponent`: la página se descarga al navegar, no al abrir la aplicación. Las pantallas viven bajo `apps/web/src/app/features/<contexto>/<página>/` y cada una tiene un controlador TypeScript y un HTML externo. No existe un componente genérico que decida qué pantalla renderizar.

```text
app.routes.ts -> lazy page -> core/api/<servicio>-api.service.ts -> /api/<servicio>/v1
                    |                  |
                    |                  +-- contratos en shared/models
                    +-- HTML externo y estado de esa pantalla
```

`core` contiene sesión, interceptores, guards y clientes HTTP; `shared` contiene tipos o controles reutilizables sin reglas de dominio. El guard sólo mejora la navegación: cada API continúa verificando identidad y permisos en el servidor. Consulta [frontend-architecture.md](frontend-architecture.md) para las reglas de dependencia y dónde colocar código nuevo.

Los estilos globales se limitan a tokens y controles comunes; cada página y componente visual mantiene su SCSS junto a su plantilla. Esto permite que la adaptación a móvil se pruebe y evolucione dentro del contexto de la pantalla, sin una hoja global que acople toda la SPA.

## Backend

Cada Laravel aplica esta dirección de dependencias:

```text
Route -> middleware -> FormRequest -> Controller -> caso de uso -> modelo / integración -> JsonResource
```

- Las rutas versionan el contrato HTTP y asignan middleware.
- El middleware valida el JWT y entrega una identidad mínima (`id`, roles y permisos) a la petición.
- Los `FormRequest` validan transporte; el caso de uso decide reglas de negocio.
- Un cliente de otro servicio es una capa anticorrupción: conoce únicamente su contrato HTTP, timeout y trazabilidad.
- Los `JsonResource` definen explícitamente qué proyección puede recibir cada consumidor.

Observation es el primer servicio que aplica todas estas capas: `CreateSighting` decide borrador/publicación, `CatalogSensitivityClient` consulta Catalog y `SightingResource` distingue la vista pública de la privada. Los demás servicios conservan el mismo límite de dominio y deben adoptar estas capas cuando se modifiquen sus casos de uso. La guía está en [backend-application-layers.md](backend-application-layers.md).

Los binarios de multimedia se almacenan en discos Laravel privados, con un volumen independiente por servicio en Docker. La base de datos no guarda fotos, audio ni video; las reglas de propiedad, exposición y una futura carga segura están en [media-storage.md](media-storage.md).

## Identidad y privacidad

Accounts firma access tokens RSA de corta duración. Catalog, Observation y Community verifican firma, emisor y vencimiento localmente con la clave pública, por lo que no hacen una llamada a Accounts por petición. Los refresh tokens se almacenan con hash y se rotan en Accounts.

El cliente guarda los tokens en `sessionStorage` durante el MVP. Es una decisión transitoria documentada: una solución de producción con mayor exposición debe migrar a BFF y cookies `HttpOnly`/`Secure` antes de añadir más datos privados en el navegador.

La posición exacta sólo existe en Observation. Al publicar, Catalog entrega una sensibilidad y Observation calcula una sola vez la proyección pública:

| Sensibilidad  | Resultado público                        |
| ------------- | ---------------------------------------- |
| `EXACT`       | coordenada original                      |
| `APPROXIMATE` | centro de una celda aproximada de 5,5 km |
| `HIDDEN`      | no hay coordenadas públicas              |

El mapa consulta columnas públicas indexadas; nunca transforma `private_lat` ni `private_lng` al responder. Si Catalog no está disponible al publicar una especie identificada, Observation falla de forma cerrada y el usuario puede guardar un borrador.

## Contratos, operación y evolución

Los contratos HTTP versionados están en `contracts/openapi/` y deben actualizarse en el mismo cambio que una ruta o respuesta. Las migrations son el contrato de persistencia de su servicio; no pueden crear foreign keys ni hacer joins con otra base.

Para desarrollo, `bash bin/catalogo-aves prepare` aplica migrations y seeders sin borrar datos. Docker usa `compose.yaml`, MySQL 8.4 y las cuatro bases inicializadas por `infra/mysql/init-databases.sql`. Los detalles diarios están en [development-guide.md](development-guide.md).

No hay broker en el MVP. Una capacidad futura de notificación, indexación o sincronización debe salir de una outbox del servicio dueño; se evaluará un broker sólo cuando existan varios consumidores o una necesidad real de entrega asíncrona. Las decisiones vigentes están indexadas en [decisions.md](decisions.md).
