# Referencia de entorno

Cada servicio parte de su propio `.env.example`. Copia ese archivo a `.env` mediante `bash bin/catalogo-aves prepare`; el archivo real queda fuera de Git. Esta guía documenta los valores de desarrollo y no sustituye la gestión de secretos de un entorno compartido o de producción.

Al renombrar una instalación existente, `prepare` no modifica un `.env` real ni renombra bases para evitar pérdida de datos. Haz copia de seguridad y migra los valores de conexión y `JWT_ISSUER` de forma coordinada; el procedimiento y sus consecuencias sobre sesiones están en el [README](../README.md#migración-desde-el-nombre-anterior).

## Variables comunes de Laravel

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `APP_NAME` | Nombre usado por Laravel en mensajes y logs. | Nombre del servicio Catálogo de Aves. |
| `APP_ENV` | Activa comportamiento de entorno. | `local`; nunca usar para identificar permisos. |
| `APP_KEY` | Clave simétrica de Laravel para cifrado interno. | La genera `prepare` si está vacía. Nunca copiar entre entornos. |
| `APP_DEBUG` | Incluye detalles de excepciones en respuestas y logs. | `true` sólo local; `false` fuera de desarrollo. |
| `APP_URL` | URL base del servicio para generación de enlaces. | El puerto local del servicio. |
| `APP_LOCALE`, `APP_FALLBACK_LOCALE`, `APP_FAKER_LOCALE` | Idioma de Laravel y datos de ejemplo. | Configuración base de Laravel en Accounts. |
| `APP_MAINTENANCE_DRIVER`, `APP_MAINTENANCE_STORE` | Lugar donde Laravel guarda el estado de mantenimiento. | `file`; sólo cambiar si se coordina entre réplicas. |
| `PHP_CLI_SERVER_WORKERS` | Procesos del servidor PHP local. | `4`; requiere `--no-reload`, ya incluido en `bin/catalogo-aves`. |
| `BCRYPT_ROUNDS` | Coste de hash de contraseñas. | `12`; reducir sólo en pruebas automatizadas. |
| `LOG_CHANNEL`, `LOG_STACK`, `LOG_DEPRECATIONS_CHANNEL`, `LOG_LEVEL` | Destino y severidad de logs. | `stack`, `single`, `debug`. |

## Persistencia, cache y procesos

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `DB_CONNECTION` | Driver de base de datos. | `mysql`. |
| `DB_HOST`, `DB_PORT` | Host y puerto MySQL. | `127.0.0.1:3306`; Docker usa `mysql`. |
| `DB_DATABASE` | Base lógica propiedad de cada servicio. | `catalogo_aves_accounts`, `catalogo_aves_catalog`, `catalogo_aves_observation` o `catalogo_aves_community`. |
| `DB_USERNAME`, `DB_PASSWORD` | Credencial del servicio para MySQL. | `catalogo_aves` / `catalogo_aves_dev`, creados por el script de infraestructura. |
| `SESSION_DRIVER`, `SESSION_*` | Persistencia y alcance de la sesión web de Laravel. | Accounts usa `database`; la SPA usa JWT, no cookies de sesión. |
| `CACHE_STORE`, `CACHE_PREFIX` | Driver y prefijo de cache de Laravel. | `database`; definir prefijo al compartir store. |
| `QUEUE_CONNECTION` | Transporte de trabajos en segundo plano. | `database` en Accounts; no supone un worker activo por sí mismo. |
| `BROADCAST_CONNECTION` | Transporte de eventos en tiempo real. | `log`; no publica a un broker. |
| `FILESYSTEM_DISK` | Disco Laravel por defecto. | `local`. |
| `MEMCACHED_HOST`, `REDIS_CLIENT`, `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_PORT` | Valores preparados para futuros drivers. | No se usan mientras cache/colas sigan en `database`. |

## Correo y almacenamiento externo

| Variable | Propósito | Desarrollo local |
| --- | --- | --- |
| `MAIL_*` | Transporte, host y remitente del correo Laravel. | `log`: los mensajes se escriben en logs, no se envían. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_USE_PATH_STYLE_ENDPOINT` | Configuración de S3 compatible. | Vacía por defecto; definir sólo si se habilita ese disco. |
| `VITE_APP_NAME` | Nombre expuesto a assets compilados por Vite de Laravel. | Hereda `APP_NAME`; la SPA Angular no depende de él. |

## JWT entre servicios

| Variable | Consumidor y propósito |
| --- | --- |
| `JWT_ISSUER` | Los cuatro servicios. Debe ser igual a `catalogo-aves-accounts`; rechaza tokens emitidos por otro contexto. |
| `JWT_ACCESS_TTL_MINUTES` | Sólo Accounts. Duración del access token emitido. |
| `JWT_PRIVATE_KEY_PATH` | Sólo Accounts. Ruta de la clave RSA privada de firma. No se comparte ni se versiona. |
| `JWT_PUBLIC_KEY_PATH` | Los cuatro servicios. Ruta de la clave pública que verifica firmas. `prepare` la crea/copia localmente. |
| `CATALOGO_AVES_OPENSSL_BINARY` | Variable transitoria usada internamente por `bin/catalogo-aves` en Windows cuando PHP no puede generar RSA. No se guarda en `.env`. |

## Variables funcionales por servicio

| Servicio | Variable | Propósito |
| --- | --- | --- |
| Accounts | `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME`, `SUPERADMIN_PASSWORD` | Superadministrador repetible para `APP_ENV=local`. `prepare accounts` lo crea o actualiza. Son credenciales públicas de demo, no valores de producción. |
| Observation | `CATALOG_URL` | URL interna de Catalog usada sólo para leer la sensibilidad de una especie antes de publicar. |

## Mapas y búsqueda de lugares

La SPA usa teselas de OpenStreetMap con Leaflet; no hay `GOOGLE_MAPS_API_KEY` ni una variable equivalente que configurar. `LocationSearchService` centraliza la búsqueda de lugares y actualmente apunta a Nominatim. Las peticiones sólo ocurren al enviar una búsqueda manual, se limitan a una por segundo y se cachean en memoria.

La URL se declara en `apps/web/public/catalogo-aves-runtime-config.json`; el servidor puede sustituir ese archivo sin recompilar Angular si se usa un proveedor autorizado o una instancia propia. No repartas esa URL por componentes ni envíes información personal al buscador.

## Reglas operativas

1. Nunca edites o subas un `.env` real. Cambia `.env.example` y esta guía cuando se agregue una variable.
2. Si cambias `APP_KEY`, rutas de claves JWT o credenciales de base, reinicia el proceso Laravel correspondiente.
3. Para rotar las claves JWT locales, ejecuta `php artisan catalogo-aves:jwt-keys --force` dentro de Accounts y luego `bash bin/catalogo-aves prepare` para volver a distribuir la pública. Nunca uses esa rotación improvisada en producción.
