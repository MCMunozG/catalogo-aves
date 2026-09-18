# ADR-005: Base lógica por servicio

**Estado:** aceptado.

## Contexto

El desarrollo local necesita ser ligero, pero compartir tablas o hacer joins entre contextos eliminaría la autonomía del dominio.

## Decisión

Un único servidor MySQL local alberga cuatro bases lógicas: `catalogo_aves_accounts`, `catalogo_aves_catalog`, `catalogo_aves_observation` y `catalogo_aves_community`. Cada servicio aplica solamente sus migrations y seeders.

## Consecuencias

El usuario puede iniciar MySQL una vez desde Workbench o Compose y mantener aislamiento de esquema. No se permiten foreign keys ni consultas cruzadas; los datos de otro contexto se obtienen por API o se tratan como una referencia externa.
