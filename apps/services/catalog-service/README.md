# Catalog Service

Es dueño del catálogo curado de especies y de su política de sensibilidad geográfica: `EXACT`, `APPROXIMATE` o `HIDDEN`. No contiene perfiles, actividad social ni ubicaciones de avistamientos.

## Operación desde Git Bash

Desde la raíz del repositorio, sin entrar a esta carpeta:

```sh
bash bin/catalogo-aves prepare catalog
bash bin/catalogo-aves service serve catalog
```

El servicio local escucha en `http://127.0.0.1:8002`. La configuración MySQL local estándar es creada por `infra/mysql/workbench-local.sql`. `prepare` aplica migrations y seeders sin borrar datos.

## API y dependencia

Expone consultas públicas de especies y operaciones administrativas protegidas bajo `/api/catalog/v1`. Observation consulta esta API al publicar una observación con especie para obtener la sensibilidad; por ello las decisiones editoriales se mantienen en Catalog. El contrato inicial está en [contracts/openapi/catalog.yaml](../../../contracts/openapi/catalog.yaml).

El catálogo inicial permite recorrer flujos completos de consulta y privacidad. Las identificaciones que se usen fuera del entorno local requieren validación editorial y fuentes taxonómicas actualizadas.
