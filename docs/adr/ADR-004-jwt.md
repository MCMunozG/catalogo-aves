# ADR-004: JWT asimétrico

**Estado:** aceptado.

## Contexto

Los servicios necesitan autenticar peticiones sin una llamada remota a Accounts por cada request. Los tokens no deben poder ser firmados por los consumidores.

## Decisión

Accounts firma access tokens de corta vida con RSA. Catalog, Observation y Community reciben sólo la clave pública y verifican firma, expiración y claims localmente. Los refresh tokens se almacenan hasheados y se rotan en Accounts.

## Consecuencias

La autenticación no añade una dependencia HTTP por petición y se limita la exposición de la clave privada. La distribución y rotación segura de claves pasa a ser una responsabilidad de despliegue; el frontend actual usa `sessionStorage` como solución transitoria del MVP.
