# Capas de aplicación en los servicios Laravel

La frontera entre servicios ya está definida por los contextos. Dentro de cada servicio se usa la siguiente separación, sin repositorios genéricos ni abstracciones compartidas entre bases:

```text
routes -> middleware -> FormRequest -> Controller -> caso de uso -> modelo/infraestructura -> Resource
```

- Los controladores traducen HTTP y coordinan un caso de uso; no contienen reglas de negocio ni SQL de varios pasos.
- Los `FormRequest` contienen la validación de entrada.
- Un caso de uso representa una acción (por ejemplo `CreateSighting`), no una tabla.
- Un cliente de otro servicio es una capa anticorrupción explícita: conoce su contrato HTTP, timeout y trazabilidad, pero no sus modelos ni su base de datos.
- Los `JsonResource` definen proyecciones públicas y privadas. Nunca se devuelve un modelo Eloquent directamente cuando puede contener campos sensibles.

## Primer referente: Observation

`CreateSighting` concentra el estado de publicación y la aplicación de privacidad. `CatalogSensitivityClient` resuelve únicamente la sensibilidad y propaga `X-Request-Id`; ante una publicación con especie sin sensibilidad disponible, el caso de uso falla de forma cerrada. `SightingResource` hace explícita la diferencia entre una respuesta para el propietario/moderación y el mapa público.

Los siguientes cortes deberían ser Accounts (emisión/rotación de tokens), Catalog (curaduría de especies) y Community (comandos de publicación, comentario y moderación). Cada corte debe incluir pruebas de autorización y de contrato, además de las unitarias de la regla de dominio.
