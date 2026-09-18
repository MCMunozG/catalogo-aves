# ADR-007: Sin gateway de aplicación

**Estado:** aceptado.

## Contexto

El MVP tiene cuatro APIs y una SPA. Introducir un gateway que agregue reglas de dominio duplicaría autorización y aumentaría el número de despliegues necesarios para cada cambio.

## Decisión

Angular compone las pantallas y Nginx/proxy de desarrollo sólo enrutan por prefijo. La autenticación, autorización y reglas de negocio permanecen en cada Laravel.

## Consecuencias

El enrutamiento es transparente y cada servicio conserva sus responsabilidades. Si en el futuro aparece una necesidad transversal real —por ejemplo rate limiting global, BFF o composición segura de múltiples APIs— se evaluará un gateway mediante un ADR nuevo, sin mover reglas de dominio por conveniencia.
