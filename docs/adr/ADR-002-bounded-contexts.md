# ADR-002: Cuatro contextos iniciales

**Estado:** aceptado.

## Contexto

Un servicio por tabla aumentaría la complejidad operativa y un monolito mezclaría reglas de identidad, conocimiento editorial, geoprivacidad y conversación social.

## Decisión

Se establecen Accounts, Catalog, Observation y Community como contextos iniciales. Cada uno es dueño de sus datos y sólo conserva identificadores opacos de los demás.

## Consecuencias

Las reglas relevantes permanecen cerca de su fuente de verdad: Catalog define sensibilidad y Observation protege ubicaciones. Nuevas capacidades se añaden al contexto que las posee o justifican un nuevo límite mediante ADR, no por comodidad de una pantalla.
