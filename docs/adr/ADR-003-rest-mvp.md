# ADR-003: REST sin broker en el MVP

**Estado:** aceptado.

## Contexto

La única dependencia síncrona actual es la consulta de sensibilidad de Observation a Catalog al publicar. Añadir un broker ahora introduce infraestructura y estados de entrega que el MVP todavía no necesita.

## Decisión

Las integraciones actuales usan HTTP REST versionado. Observation falla de manera cerrada si Catalog no responde durante una publicación sensible.

## Consecuencias

La ejecución y el diagnóstico inicial son simples, pero la disponibilidad de Catalog afecta a esa publicación concreta. Cuando existan varios efectos secundarios asíncronos se incorporará una outbox por servicio y un broker, sin permitir escritura directa entre bases.
