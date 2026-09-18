# ADR-009: Capas de aplicación explícitas en Laravel

**Estado:** aceptado.

## Contexto

Los controladores iniciales mezclaban validación HTTP, reglas de dominio, persistencia y llamadas a otros servicios. Esta mezcla reduce la capacidad de probar reglas sensibles y puede filtrar detalles de almacenamiento en las respuestas.

## Decisión

Los casos que tengan reglas propias siguen el flujo `Route -> middleware -> FormRequest -> Controller -> caso de uso -> modelo o integración -> JsonResource`. La primera aplicación es Observation: su caso de uso crea el avistamiento, su cliente de Catalog encapsula la dependencia remota y su recurso decide la proyección de ubicación.

## Consecuencias

Se prueban reglas y proyecciones sin depender del controlador, y el límite con otro contexto deja de estar disperso. No se introducen repositorios genéricos, CQRS o una librería compartida de dominio: cada servicio continúa siendo autónomo. Accounts, Catalog y Community migrarán a este patrón al tocar sus casos de uso.
