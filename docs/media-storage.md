# Almacenamiento de imágenes y multimedia

Los binarios no se guardan en MySQL ni se incorporan como Base64 en una respuesta JSON. Cada servicio dueño del contenido tiene un disco Laravel privado llamado `media`, con raíz en `storage/app/private/media`.

| Contexto dueño | Directorio inicial | Contenido previsto |
| --- | --- | --- |
| Accounts | `accounts-service/storage/app/private/media/avatars` | Avatares de perfiles. |
| Catalog | `catalog-service/storage/app/private/media/species` | Imágenes editoriales de especies. |
| Observation | `observation-service/storage/app/private/media/sightings` | Fotos, audios y evidencias de un avistamiento. |
| Community | `community-service/storage/app/private/media/posts` | Adjuntos de publicaciones aprobadas. |

Los archivos `.gitkeep` sólo conservan la estructura vacía en Git. Las fotos, audios, videos y archivos generados quedan fuera del repositorio. En Docker, cada raíz se monta en su propio volumen nombrado (`accounts-media`, `catalog-media`, `observation-media` o `community-media`), por lo que reiniciar un contenedor no elimina sus archivos.

## Reglas de implementación

1. Un endpoint de carga debe recibir `multipart/form-data`, validar tamaño, tipo MIME real y autorización antes de usar `Storage::disk('media')`.
2. Los nombres deben ser generados por el servidor y segmentados por el recurso propietario; nunca se debe confiar en el nombre original ni permitir rutas relativas del cliente.
3. El disco es privado. Para descargar o mostrar un archivo se añadirá un endpoint del contexto dueño que autorice al sujeto antes de transmitirlo; no se creará un enlace bajo `public/storage`.
4. Cuando una capacidad necesite relacionar un archivo con un recurso, la base sólo podrá guardar metadatos mínimos como ruta opaca, tipo, tamaño y checksum. El contenido binario permanece exclusivamente en el disco.
5. Antes de habilitar videos o producción se debe sustituir el disco local por almacenamiento de objetos, antivirus/escaneo y política de retención. El contrato `media` evita que la aplicación dependa de la tecnología concreta.

Por ahora se creó la infraestructura de almacenamiento; no se agregó un formulario de carga ficticio ni un endpoint sin las reglas de autorización y validación requeridas.
