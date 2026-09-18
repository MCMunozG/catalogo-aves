# Índice de decisiones arquitectónicas

Los ADR registran una decisión que costaría revertir, su motivo y sus consecuencias. Un cambio de implementación local no necesita ADR; un cambio de límite de dominio, seguridad, persistencia, integración o forma de desplegar sí.

| ADR                                                | Decisión                                  | Estado   |
| -------------------------------------------------- | ----------------------------------------- | -------- |
| [001](adr/ADR-001-monorepo.md)                     | Monorepo con aplicaciones desplegables    | Aceptado |
| [002](adr/ADR-002-bounded-contexts.md)             | Cuatro contextos iniciales                | Aceptado |
| [003](adr/ADR-003-rest-mvp.md)                     | REST sin broker en el MVP                 | Aceptado |
| [004](adr/ADR-004-jwt.md)                          | JWT asimétrico                            | Aceptado |
| [005](adr/ADR-005-logical-database-per-service.md) | Base lógica por servicio                  | Aceptado |
| [006](adr/ADR-006-geographic-privacy.md)           | Privacidad geográfica en origen           | Aceptado |
| [007](adr/ADR-007-no-application-gateway.md)       | Sin gateway de aplicación                 | Aceptado |
| [008](adr/ADR-008-frontend-feature-first.md)       | Frontend feature-first con páginas lazy   | Aceptado |
| [009](adr/ADR-009-backend-application-layers.md)   | Capas de aplicación explícitas en Laravel | Aceptado |
| [010](adr/ADR-010-component-scoped-styles.md)      | Estilos encapsulados por componente        | Aceptado |
| [011](adr/ADR-011-private-media-disks.md)          | Multimedia privada por contexto            | Aceptado |

Al proponer una nueva decisión, crea `ADR-<número>-<nombre>.md`, enlázala aquí y actualiza `architecture.md`, `service-boundaries.md` y el OpenAPI afectado cuando corresponda.
