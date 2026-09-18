<?php

namespace App\Http\Middleware;

use Closure;
use DateTimeImmutable;
use Illuminate\Http\Request;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

/**
 * Verifica un JWT emitido por Accounts y expone sólo sus claims de identidad a la petición.
 * Catalog usa la clave pública; no puede emitir tokens.
 */
class AuthenticateJwt
{
    public function handle(Request $request, Closure $next)
    {
        $raw = $request->bearerToken();
        if (!$raw) return response()->json(['code' => 'UNAUTHENTICATED', 'message' => 'Bearer token required', 'requestId' => $request->attributes->get('requestId')], 401);
        try {
            // Este servicio nunca firma tokens. Lcobucci aún requiere ambas claves
            // para construir una configuración, por lo que se proporciona la clave pública
            // en ambas posiciones y sólo se usa en la validación SignedWith de abajo.
            $publicKey = InMemory::file(config('catalogo_aves.public_key'));
            $config = Configuration::forAsymmetricSigner(new Sha256(), $publicKey, $publicKey);
            $token = $config->parser()->parse($raw);
            if (!$config->validator()->validate($token, new SignedWith(new Sha256(), InMemory::file(config('catalogo_aves.public_key')))) || $token->claims()->get('iss') !== config('catalogo_aves.issuer') || $token->isExpired(new DateTimeImmutable())) throw new \RuntimeException('Invalid token');
            $request->attributes->set('identity', ['id' => $token->claims()->get('sub'), 'roles' => $token->claims()->get('roles', []), 'permissions' => $token->claims()->get('permissions', [])]);
        } catch (\Throwable) {
            return response()->json(['code' => 'UNAUTHENTICATED', 'message' => 'Invalid or expired token', 'requestId' => $request->attributes->get('requestId')], 401);
        }
        return $next($request);
    }
}
