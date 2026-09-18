# Límites de servicio

## Propiedad de datos y capacidades

| Servicio    | Es dueño de                                                                            | Puede exponer                                      | No puede almacenar ni modificar                                    |
| ----------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Accounts    | usuarios, perfiles, roles y refresh tokens                                             | identidad autenticada y JWT                        | avistamientos, especies, coordenadas o contenido comunitario       |
| Catalog     | especies y sensibilidad editorial                                                      | ficha y sensibilidad de una especie                | usuarios, actividad social o ubicaciones de observación            |
| Observation | avistamientos y sus representaciones geográficas privada/pública                       | borradores del dueño, avistamientos y mapa público | perfiles completos, tablas de especies o moderación comunitaria    |
| Community   | posts, comentarios, reacciones, follows, reportes, auditoría y notificaciones internas | feed y estado de participación                     | coordenadas, datos privados de avistamientos o edición de especies |

Un `user_id`, `species_id` o `observation_id` foráneo es una referencia opaca (ULID), no una relación SQL a otro servicio. Cada servicio valida la identidad mediante el JWT y sólo consulta otro dominio por su API cuando la regla lo requiere.

## Integraciones permitidas

| Consumidor                      | Proveedor            | Motivo                                           | Regla ante fallo                                                   |
| ------------------------------- | -------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| SPA Angular                     | Los cuatro servicios | Componer pantallas y enviar acciones del usuario | Mostrar error de API sin inventar datos.                           |
| Observation                     | Catalog              | Obtener sensibilidad al publicar una especie     | Fallar cerrando: no publicar y mantener borrador.                  |
| Catalog, Observation, Community | Accounts (indirecto) | Verificar JWT con clave pública local            | Rechazar token inválido o vencido; no llamada remota por petición. |

La verificación de JWT no es una dependencia HTTP de Accounts: cada consumidor contiene la clave pública distribuida durante el despliegue.

## Reglas que protegen la frontera

- Ningún servicio importa modelos, factories, migrations o código de persistencia de otro servicio.
- Ninguna migration añade una foreign key hacia una base externa y no se ejecutan joins entre bases.
- Community puede referenciar un avistamiento, una ruta o una especie, pero no puede editarlo ni guardar su ubicación.
- Accounts no replica perfiles en otros dominios; los consumidores conservan sólo el identificador que necesitan.
- Catalog define la sensibilidad; Observation aplica esa política y es el único dueño de coordenadas.
- Una acción de moderación sobre Observation debe ser una petición autenticada a su API y dejar auditoría en Community; nunca un `UPDATE` directo de su base.

## Direcciones de evolución

Las futuras notificaciones, indexación o sincronizaciones deben salir de una outbox del servicio dueño. Un broker podrá distribuir esos eventos cuando haya más de una necesidad asíncrona; no se debe introducir como un canal alternativo para escribir en la base de otro servicio.

Antes de añadir rutas, viajes, identificación o medios se debe decidir su fuente de verdad y actualizar esta matriz, el OpenAPI correspondiente y un ADR si cambia una dependencia relevante.
