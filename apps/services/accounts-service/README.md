# Accounts Service

Es dueño de la identidad: registro, login, perfiles, roles, access tokens RSA y refresh tokens hasheados. No guarda avistamientos, especies ni contenido comunitario.

## Operación desde Git Bash

Desde la raíz del repositorio, sin entrar a esta carpeta:

```sh
bash bin/catalogo-aves prepare accounts
bash bin/catalogo-aves service serve accounts
```

El servicio local escucha en `http://127.0.0.1:8001`. `prepare` prepara claves JWT, aplica migrations y seeders sin borrar datos. La configuración MySQL local estándar es creada por `infra/mysql/workbench-local.sql`; el flujo completo está en el [README raíz](../../../README.md).

En la primera preparación, Accounts crea sus claves RSA de JWT si no existen. La clave privada no sale de este servicio; `bin/catalogo-aves` distribuye sólo la pública a los servicios que verifican tokens.

En `APP_ENV=local`, `prepare accounts` crea o actualiza automáticamente el superadministrador de desarrollo. No uses estas credenciales fuera de tu equipo:

```text
Correo: admin@catalogo-aves.local
Contraseña: CatalogoAvesAdmin2026!
```

Para sustituirlas localmente, define `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME` y `SUPERADMIN_PASSWORD` en `.env` antes de ejecutar `prepare accounts`.

El registro público genera siempre el rol `user`.

## API y dependencia

Expone `/api/accounts/v1/auth/register`, `/login`, `/refresh`, `/logout` y `/api/accounts/v1/me`. Firma JWT con su clave privada; Catalog, Observation y Community sólo reciben la clave pública para validar tokens localmente. El contrato inicial está en [contracts/openapi/accounts.yaml](../../../contracts/openapi/accounts.yaml).
