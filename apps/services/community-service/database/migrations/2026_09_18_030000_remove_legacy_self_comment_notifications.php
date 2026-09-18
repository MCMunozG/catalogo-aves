<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El primer flujo de comentarios creó avisos para quien comentaba y apuntó al comentario,
 * no a la publicación. Esos avisos no representan actividad recibida y se eliminan una vez.
 */
return new class extends Migration {
    public function up(): void
    {
        DB::table('notifications')
            ->where('type', 'COMMENT')
            ->whereIn('reference_id', DB::table('comments')->select('id'))
            ->delete();
    }

    /** La eliminación es irreversible porque esos avisos carecen de un destino válido. */
    public function down(): void {}
};
