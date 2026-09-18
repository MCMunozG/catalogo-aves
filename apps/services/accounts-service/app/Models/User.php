<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

/** Es dueño de identidad/perfil y traduce el rol almacenado a permisos JWT. */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUlids;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Atributos permitidos para asignación masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'bio',
        'general_location',
        'privacy_settings',
        'preferences',
        'avatar_path',
    ];

    /**
     * Atributos que deben ocultarse al serializar.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversiones de tipo aplicadas a los atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'privacy_settings' => 'array',
            'preferences' => 'array',
        ];
    }

    /**
     * Devuelve permisos incluidos al emitir el token; los servicios consumidores confían en esta instantánea.
     *
     * @return list<string>
     */
    public function permissions(): array
    {
        return match ($this->role) {
            'superadmin' => ['platform.manage', 'user.manage', 'catalog.manage', 'moderation.manage', 'sighting.review'],
            'admin' => ['user.manage', 'catalog.manage', 'moderation.manage', 'sighting.review'],
            'moderator' => ['report.review', 'content.hide', 'sighting.review'],
            'curator' => ['species.create', 'species.update', 'species.media.manage'],
            default => ['profile.self', 'sighting.create', 'post.create', 'comment.create'],
        };
    }
}
