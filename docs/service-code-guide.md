# Guía de código para los servicios Laravel

## Estructura esperada

```text
app/
  Http/
    Controllers/     # adaptadores HTTP, sin reglas complejas
    Middleware/      # identidad y trazabilidad
    Requests/        # validación de entrada
    Resources/       # proyecciones de salida
  Domain/
    <Contexto>/      # casos de uso y clientes anticorrupción
  Models/            # persistencia de este servicio
  Services/          # reglas pequeñas sin estado compartido
database/
  migrations/        # esquema del servicio
  seeders/           # datos repetibles de desarrollo
routes/api.php       # superficie HTTP versionada
```

Observation ya usa todas las carpetas porque tiene la regla más sensible. En los otros servicios todavía hay controladores iniciales más compactos; al modificar uno, extrae el caso de uso y la proyección en vez de aumentar ese controlador.

## Lectura de una petición autenticada

1. `CorrelationId` toma o genera `X-Request-Id` y lo devuelve en la respuesta.
2. `AuthenticateJwt` verifica el bearer token RSA y guarda `identity` en los atributos de la petición.
3. La ruta entrega el control al controlador con esa identidad ya verificada.
4. El controlador verifica propiedad o rol y delega el trabajo.

El atributo `identity` no es un perfil replicado. Contiene sólo `id`, `roles` y `permissions` emitidos por Accounts. Si un caso necesita información de otro dominio, debe definir una API explícita para ella.

## Ejemplo: publicar un avistamiento

`StoreSightingRequest` valida formato y rangos. `SightingController` extrae actor y correlación. `CreateSighting` obtiene la sensibilidad mediante `CatalogSensitivityClient`, decide entre `DRAFT`, `PUBLISHED` y `NEEDS_IDENTIFICATION`, y pide a `LocationPrivacy` la proyección pública. Finalmente `SightingResource` evita que el mapa reciba la ubicación privada.

La consulta a Catalog tiene timeout, propaga el id de correlación y devuelve `null` si el contrato o la red fallan. Para una publicación con especie conocida, `null` se traduce en `503 CATALOG_UNAVAILABLE`; para un borrador no impide guardar el avistamiento.
