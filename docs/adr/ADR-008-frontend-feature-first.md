# ADR-008: Frontend feature-first con páginas lazy

**Estado:** aceptado.

## Contexto

La SPA concentraba todas las rutas, estados, llamadas HTTP y HTML en un único componente. Eso hacía difícil encontrar código, obligaba a cargar todas las pantallas al inicio y volvía riesgoso cambiar una funcionalidad aislada.

## Decisión

Cada pantalla se organiza bajo `features/<contexto>/<página>/` con un archivo TypeScript y un HTML externo. `app.routes.ts` compone la navegación y usa `loadComponent` para cargar las páginas de forma perezosa. Los clientes REST viven en `core/api` y los contratos de transporte en `shared/models`.

## Consecuencias

Los límites visuales y de carga siguen los contextos de producto, y no queda HTML de gran tamaño dentro de strings TypeScript. Aparecen más archivos, pero cada uno tiene una responsabilidad local y una ruta fácil de descubrir. Una pantalla que crezca se dividirá dentro de su propio contexto (`ui/`, `data-access/`), no mediante otro componente global.
