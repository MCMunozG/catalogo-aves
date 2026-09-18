<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/** Expone sólo campos de perfil propiedad del sujeto codificado en el JWT. */
class ProfileController extends Controller
{
    /** Devuelve la proyección segura del perfil del usuario actual. */
    public function show(Request $r)
    {
        return User::findOrFail($r->attributes->get('identity')['id'])->only(['id', 'name', 'email', 'role', 'bio', 'general_location', 'privacy_settings', 'preferences', 'avatar_path']);
    }
    /** Actualiza campos permitidos del perfil; roles y credenciales usan endpoints separados. */
    public function update(Request $r)
    {
        $user = User::findOrFail($r->attributes->get('identity')['id']);
        $user->update($r->validate(['name' => 'sometimes|string|max:120', 'bio' => 'nullable|string|max:1000', 'general_location' => 'nullable|string|max:120', 'privacy_settings' => 'sometimes|array', 'preferences' => 'sometimes|array']));
        return $this->show($r);
    }
}
