<?php

namespace App\Services;

use App\Models\User;
use DateInterval;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;

/** Accounts es el único contexto autorizado para firmar access tokens. */
class JwtService
{
    /**
     * Firma un access token de corta duración con sólo los claims de identidad que necesitan otros servicios.
     * El ciclo de vida del refresh token permanece intencionalmente en AuthController y la base de Accounts.
     */
    public function issue(User $user): string
    {
        $now = new DateTimeImmutable();
        $config = Configuration::forAsymmetricSigner(new Sha256(), InMemory::file(config('catalogo_aves.private_key')), InMemory::file(config('catalogo_aves.public_key')));
        return $config->builder()->issuedBy(config('catalogo_aves.issuer'))->relatedTo((string) $user->id)->issuedAt($now)->expiresAt($now->add(new DateInterval('PT' . config('catalogo_aves.access_ttl_minutes') . 'M')))->withClaim('roles', [$user->role])->withClaim('permissions', $user->permissions())->getToken($config->signer(), $config->signingKey())->toString();
    }
}
