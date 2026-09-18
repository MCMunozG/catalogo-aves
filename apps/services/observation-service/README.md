# Observation Service

Es dueño de avistamientos, sus coordenadas privadas, su representación pública y el ciclo borrador/publicado. No replica usuarios ni especies: conserva únicamente sus ULID externos.

## Operación desde Git Bash

Desde la raíz del repositorio, sin entrar a esta carpeta:

```sh
bash bin/catalogo-aves prepare observation
bash bin/catalogo-aves service serve observation
```

El servicio local escucha en `http://127.0.0.1:8003`. Su `.env` apunta a Catalog mediante `CATALOG_URL`; con los puertos locales estándar debe ser `http://127.0.0.1:8002`.

## Privacidad y dependencia

Las coordenadas privadas nunca se usan en el mapa público. Según la política recibida de Catalog, una observación queda como `EXACT`, se aproxima a una cuadrícula de unos 5,5 km o se oculta por completo. Al publicar una especie conocida, si Catalog no está disponible o no proporciona sensibilidad, la operación se niega de manera conservadora y la observación puede permanecer como borrador.

Expone recursos privados y públicos bajo `/api/observations/v1`. El contrato inicial está en [contracts/openapi/observations.yaml](../../../contracts/openapi/observations.yaml).
