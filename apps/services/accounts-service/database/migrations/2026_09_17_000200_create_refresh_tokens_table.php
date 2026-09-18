<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Almacena refresh tokens hasheados y revocables; los valores en bruto nunca se persisten. */
return new class extends Migration {
    /** Crea la tabla de ciclo de vida de refresh tokens propiedad de Accounts. */
    public function up(): void
    {
        Schema::create('refresh_tokens', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $t->string('token_hash', 64)->unique();
            $t->timestamp('expires_at');
            $t->timestamp('revoked_at')->nullable();
            $t->timestamps();
        });
    }
    /** Elimina la tabla al revertir esta migración. */
    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};
