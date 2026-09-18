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
    'private_key' => $keyPath(env('JWT_PRIVATE_KEY_PATH'), storage_path('app/keys/jwt-private.pem')),
    'public_key' => $keyPath(env('JWT_PUBLIC_KEY_PATH'), storage_path('app/keys/jwt-public.pem')),
    'access_ttl_minutes' => (int) env('JWT_ACCESS_TTL_MINUTES', 15),
    'local_superadmin' => [
        'email' => env('SUPERADMIN_EMAIL') ?: 'admin@catalogo-aves.local',
        'name' => env('SUPERADMIN_NAME') ?: 'Catálogo de Aves Admin',
        'password' => env('SUPERADMIN_PASSWORD') ?: 'CatalogoAvesAdmin2026!',
    ],
];
