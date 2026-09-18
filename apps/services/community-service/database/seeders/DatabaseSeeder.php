<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Carga un escenario navegable de Community: publicaciones públicas, comentarios,
     * reacciones, seguimientos y notificaciones vinculadas a publicaciones reales.
     */
    public function run(): void
    {
        $now = now();
        $messages = [
            'El amanecer estuvo muy quieto hasta que empezaron a responder los primeros llamados desde el borde del bosque.',
            'Hoy confirmé lo útil que es quedarse unos minutos en silencio antes de avanzar por el sendero.',
            'Comparto esta observación porque el comportamiento fue más revelador que el plumaje a la distancia.',
            'Una salida corta por el humedal dejó varias preguntas para revisar con calma en el catálogo.',
            'Encontré actividad intensa en los árboles con frutos; vale la pena volver a la misma hora.',
            'Recordatorio amistoso: una buena observación no necesita acercarse demasiado al ave.',
            'La lluvia cambió por completo el paisaje sonoro y aparecieron llamadas que no había escuchado temprano.',
            'Registrar notas breves en el momento ayudó mucho al revisar la identificación después.',
            'La comunidad local compartió recomendaciones para recorrer este lugar sin salir de los senderos.',
            'Una mañana nublada también puede ser una gran salida si se observa con paciencia.',
            'Dejé la ubicación protegida porque el contexto de la especie lo requiere.',
            '¿Qué rasgos usan ustedes para diferenciar aves similares cuando la luz es baja?',
            'Compartimos este recorrido para que otras personas puedan prepararse antes de visitar el área.',
            'El mejor hallazgo de hoy fue escuchar primero y mirar después.',
            'La bitácora empieza a mostrar patrones interesantes entre hora, clima y actividad.',
            'Gracias a quienes ayudan a revisar registros sin exponer sitios sensibles.',
            'Una observación sin identificar también aporta cuando incluye fecha, lugar general y buenas notas.',
            'Cierro la salida con muchas especies por estudiar y ganas de volver con más calma.',
        ];

        foreach ($messages as $index => $body) {
            $postId = $this->externalId(7001 + $index);
            DB::table('posts')->updateOrInsert(
                ['id' => $postId],
                [
                    'author_id' => $this->externalId(1 + ($index % 12)),
                    'body' => $body,
                    'reference_type' => $index % 5 === 0 ? 'species' : ($index % 4 === 0 ? 'route' : 'sighting'),
                    'reference_id' => $index % 5 === 0 ? $this->externalId(101 + ($index % 24)) : ($index % 4 === 0 ? $this->externalId(9001 + $index) : $this->externalId(5001 + ($index % 60))),
                    'visibility' => 'PUBLIC',
                    'created_at' => $now->copy()->subHours($index * 9),
                    'updated_at' => $now,
                ],
            );

            foreach (range(1, 2) as $comment) {
                $commentId = $this->externalId(8000 + ($index * 2) + $comment);
                DB::table('comments')->updateOrInsert(
                    ['id' => $commentId],
                    [
                        'post_id' => $postId,
                        'author_id' => $this->externalId(1 + (($index + $comment + 3) % 12)),
                        'body' => $comment === 1 ? 'Gracias por compartir el contexto. Me ayuda a planear mi próxima salida.' : 'Buen recordatorio sobre observar sin intervenir el comportamiento.',
                        'created_at' => $now->copy()->subHours(($index * 9) - $comment),
                        'updated_at' => $now,
                    ],
                );
            }
            foreach (range(1, 3) as $reaction) {
                DB::table('reactions')->updateOrInsert(
                    ['post_id' => $postId, 'user_id' => $this->externalId(1 + (($index + $reaction + 5) % 12))],
                    ['reaction' => ['LIKE', 'LOVE', 'THANKS'][$reaction - 1], 'created_at' => $now, 'updated_at' => $now],
                );
            }
        }

        foreach (range(1, 12) as $user) {
            DB::table('follows')->updateOrInsert(
                ['follower_id' => $this->externalId($user), 'followed_id' => $this->externalId(($user % 12) + 1)],
                ['created_at' => $now, 'updated_at' => $now],
            );
            DB::table('notifications')->updateOrInsert(
                ['id' => $this->externalId(10000 + $user)],
                ['user_id' => $this->externalId($user), 'type' => 'COMMUNITY_ACTIVITY', 'reference_id' => $this->externalId(7001 + (($user - 1) % 18)), 'body' => 'Hay nueva actividad en una publicación que sigues.', 'read_at' => $user % 3 === 0 ? $now->copy()->subHours(2) : null, 'created_at' => $now->copy()->subHours($user), 'updated_at' => $now],
            );
        }

        foreach (range(1, 4) as $report) {
            $reportId = $this->externalId(11000 + $report);
            DB::table('reports')->updateOrInsert(
                ['id' => $reportId],
                ['reporter_id' => $this->externalId($report), 'target_type' => 'post', 'target_id' => $this->externalId(7000 + $report), 'reason' => ['INAPPROPRIATE', 'INCORRECT_SPECIES', 'INCORRECT_LOCATION', 'FAUNA_RISK'][$report - 1], 'detail' => 'Caso generado para revisar el flujo de moderación y auditoría.', 'status' => $report < 3 ? 'RESOLVED' : 'OPEN', 'created_at' => $now->copy()->subDays($report), 'updated_at' => $now],
            );
            if ($report < 3) {
                DB::table('audit_records')->updateOrInsert(
                    ['id' => $this->externalId(12000 + $report)],
                    ['actor_id' => $this->externalId(4), 'target_type' => 'report', 'target_id' => $reportId, 'action' => $report === 1 ? 'REQUEST_EVIDENCE' : 'HIDE', 'reason' => 'Acción registrada durante la revisión de contenido.', 'created_at' => $now, 'updated_at' => $now],
                );
            }
        }
    }

    private function externalId(int $number): string
    {
        return '01J' . str_pad((string) $number, 23, '0', STR_PAD_LEFT);
    }
}
