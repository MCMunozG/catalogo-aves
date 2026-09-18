<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Agrega campos de perfil y rol de Cénit sin alterar la tabla base users de Laravel. */
return new class extends Migration {
    /** Aplica la extensión de perfil propiedad de Accounts. */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('user');
            $t->text('bio')->nullable();
            $t->string('general_location')->nullable();
            $t->json('privacy_settings')->nullable();
            $t->json('preferences')->nullable();
            $t->string('avatar_path')->nullable();
        });
    }
    /** Elimina sólo los campos introducidos por esta migración. */
    public function down(): void
    {
        Schema::table('users', fn(Blueprint $t) => $t->dropColumn(['role', 'bio', 'general_location', 'privacy_settings', 'preferences', 'avatar_path']));
    }
};
