# ADR-011: Multimedia privada en discos por contexto

**Estado:** aceptado.

## Contexto

Fotos, audios y videos pueden ser grandes, contener metadatos sensibles y no pertenecen a una fila de MySQL. Cénit está compuesto por servicios autónomos, por lo que tampoco debe existir una carpeta compartida sin propietario.

## Decisión

Cada Laravel configura un disco privado `media` bajo `storage/app/private/media`; Accounts posee avatares, Catalog imágenes editoriales, Observation evidencias de avistamientos y Community adjuntos de posts. Docker monta un volumen persistente independiente por servicio. Un registro puede referenciar metadatos mínimos en el futuro, pero el binario nunca se guarda en la base, no se publica en `public/storage` y sólo se entrega desde el contexto dueño tras autorizar la petición.

## Consecuencias

Se preserva la privacidad de las evidencias y se evita cargar MySQL con binarios. Las futuras cargas deben implementar validación MIME/tamaño, nombres generados por servidor, autorización, escaneo y retención. Para producción o video se podrá reemplazar el disco por object storage sin cambiar la regla de propiedad.
