# Arquitectura del frontend

## Estructura aplicada

Cada pantalla es un componente standalone, con TypeScript, HTML y SCSS en archivos separados, ubicado en su contexto de producto y cargado de forma perezosa por el router.

```text
src/app/
  core/
    api/                       # un cliente REST por servicio remoto
    auth.guard.ts               # acceso autenticado
    location-search.service.ts  # búsqueda de lugares con proveedor intercambiable
    session.service.ts          # sesión de cliente
  features/
    accounts/{auth,profile}/
    catalog/{species-list,species-detail}/
    community/{community-feed,notifications}/
    discovery/{home,explore}/
    observations/{map,new-sighting,my-sightings}/
    planning/
    tools/
  shared/
    models/                     # contratos TypeScript por contexto
    open-street-map.component.*
```

No hay un componente de páginas genérico ni plantillas grandes dentro de strings TypeScript. `app.routes.ts` es la única composición de navegación y cada ruta usa `loadComponent`.

## Estilos y adaptación

`src/styles.scss` sólo carga estilos de terceros y `styles/_foundation.scss`: tokens de color, tipografía, controles y ajustes transversales. Cada página, `AppComponent` y control visual reutilizable declara su propio `styleUrl`; por eso una modificación de `new-sighting.page.scss` no puede cambiar accidentalmente el catálogo o el feed.

Los estilos se diseñan desde el contenido flexible: grids con `minmax`, tamaños con `clamp`, botones táctiles de al menos 2,7 rem y puntos de quiebre en 991 px y 575 px. Antes de sumar una regla global, debe comprobarse que no pertenezca a una página o componente concreto.

## Regla de dependencia

Una página no llama directamente a `HttpClient` ni importa tipos de otro contexto. Habla con el cliente de su API en `core/api`; los contratos de red viven en `shared/models`. `shared` no contiene reglas de negocio.

Cuando una pantalla crezca, se divide en `ui/` (presentación) y `data-access/` (fachada o estado) dentro de su mismo contexto, sin volver a crear un componente global.

## Reglas operativas

- Los guards deciden si hay sesión; el backend sigue siendo la autoridad de permisos.
- Las respuestas paginadas se mantienen como tales; no se pierde metadato de paginación en los clientes.
- Los datos de ejemplo son un fallback de desarrollo, nunca una respuesta silenciosa de producción.
- Los mapas usan Leaflet/OpenStreetMap. El selector de avistamientos sólo permite buscar o escoger visualmente: las coordenadas son un detalle interno del contrato HTTP, nunca un campo de la interfaz.
- `LocationSearchService` no implementa autocompletado; limita, cachea y centraliza el proveedor para cumplir su política de uso. Su URL se obtiene de `catalogo-aves-runtime-config.json`, así se puede sustituir sin recompilar la SPA.
- El refresh y revocación de sesión se resolverán antes de mover la sesión a BFF + cookies `HttpOnly`, que es la dirección recomendada para producción.
