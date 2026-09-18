# ADR-010: Estilos encapsulados por página y componente

**Estado:** aceptado.

## Contexto

La SPA concentraba reglas de todas las pantallas en `src/styles.scss`. El archivo mezclaba la cabecera, formularios, mapa, catálogo y feed; cualquier ajuste visual tenía alcance incierto y los puntos de quiebre estaban dispersos.

## Decisión

`styles.scss` queda limitado a la carga de dependencias y a `styles/_foundation.scss`, que contiene tokens y reglas realmente globales. Cada pantalla standalone, `AppComponent` y componente compartido visual declara `styleUrl` y conserva su SCSS junto al TypeScript y HTML. El diseño usa una escala responsive común: `clamp`, grids flexibles y ajustes para 991 px y 575 px.

## Consecuencias

Los cambios visuales se encuentran junto a la ruta que modifican y Angular los encapsula. Aparecen más archivos pequeños, pero se evita una hoja global creciente. Los tokens se cambian en un único lugar sin permitir que las reglas de una feature se filtren a otra.
