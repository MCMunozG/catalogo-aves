<?php

/**
 * Configuración estándar de Laravel para este servicio.
 * Las decisiones de Catálogo de Aves y las variables de entorno se documentan en docs/environment-reference.md.
 */
$keyPath = static function (?string $path, string $fallback): string {
    $path ??= $fallback;
    return preg_match('/^(?:[A-Za-z]:[\\\\\/]|\/)/', $path) ? $path : base_path($path);
};

return [
    'issuer' => env('JWT_ISSUER', 'catalogo-aves-accounts'),
    'public_key' => $keyPath(env('JWT_PUBLIC_KEY_PATH'), storage_path('app/keys/jwt-public.pem')),
    'catalog_url' => env('CATALOG_URL', 'http://localhost:8002'),
    'catalog_timeout_seconds' => env('CATALOG_TIMEOUT_SECONDS', 2),
];
