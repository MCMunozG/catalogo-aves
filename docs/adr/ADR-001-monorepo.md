# ADR-001: Monorepo con servicios desplegables

**Estado:** aceptado.

## Contexto

La web y los servicios comparten contratos, decisiones de arquitectura y una experiencia de desarrollo, pero deben poder ejecutarse y desplegarse de forma independiente.

## Decisión

Se conserva un único repositorio con `apps/web` y una aplicación Laravel completa por servicio en `apps/services`. Cada servicio tiene dependencias, entorno, migrations, seeders y Dockerfile propios.

## Consecuencias

Se simplifica la coordinación de cambios y la documentación común, sin obligar a desplegar todos los servicios juntos. A cambio, los cambios entre APIs requieren mantener los contratos y pruebas de compatibilidad de manera explícita.
