# ADR-006: Privacidad geográfica en origen

**Estado:** aceptado.

## Contexto

Las ubicaciones exactas de especies sensibles no pueden depender de que cada cliente aplique correctamente una regla de ocultamiento.

## Decisión

Observation mantiene coordenadas privadas separadas de la representación pública. Catalog proporciona `EXACT`, `APPROXIMATE` o `HIDDEN`; Observation deriva el valor público al publicar y no publica si no puede obtener la política.

## Consecuencias

Las consultas de mapa no necesitan leer ni transformar coordenadas privadas. La consistencia editorial se vuelve una dependencia de publicación de Catalog y cualquier cambio futuro de política debe considerar cómo recalcular los valores públicos ya existentes.
