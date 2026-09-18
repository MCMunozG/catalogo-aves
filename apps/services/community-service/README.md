# Community Service

Es dueño del feed, posts, comentarios, reacciones, follows, reportes, auditoría y notificaciones internas. Puede guardar ULID de entidades externas, pero no replica usuarios, avistamientos ni coordenadas privadas.

## Operación desde Git Bash

Desde la raíz del repositorio, sin entrar a esta carpeta:

```sh
bash bin/catalogo-aves prepare community
bash bin/catalogo-aves service serve community
```

El servicio local escucha en `http://127.0.0.1:8004`. `prepare` aplica migrations y seeders sin borrar datos; la configuración MySQL local estándar se crea con `infra/mysql/workbench-local.sql`.

## API y moderación

Expone feed, publicaciones, comentarios, reacciones y reportes bajo `/api/community/v1`. Las decisiones de moderación se auditan aquí, pero una acción futura sobre una entidad de Observation deberá invocar la API de Observation autenticadamente: Community nunca actualiza su base de datos. El contrato inicial está en [contracts/openapi/community.yaml](../../../contracts/openapi/community.yaml).
