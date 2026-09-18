<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Siembra datos repetibles de demostración sin convertirlos en cuentas de producción. */
class DatabaseSeeder extends Seeder
{
    /** Actualiza perfiles de ejemplo y, sólo localmente, el superadministrador documentado. */
    public function run(): void
    {
        $now = now();
        $people = [
            ['Mariana Torres', 'mariana.torres@catalogo-aves.local', 'user', 'Bogotá, Colombia', 'Observadora de bosque andino y aprendiz de fotografía de naturaleza.'],
            ['Tomás Rojas', 'tomas.rojas@catalogo-aves.local', 'user', 'Chingaza, Colombia', 'Guía local interesado en aves altoandinas y restauración ecológica.'],
            ['Elena Cárdenas', 'elena.cardenas@catalogo-aves.local', 'curator', 'Medellín, Colombia', 'Bióloga y curadora de registros para la comunidad de Catálogo de Aves.'],
            ['Samuel Pardo', 'samuel.pardo@catalogo-aves.local', 'moderator', 'Cali, Colombia', 'Moderador comunitario y observador de humedales urbanos.'],
            ['Lucía Herrera', 'lucia.herrera@catalogo-aves.local', 'user', 'Manizales, Colombia', 'Exploro senderos de niebla, especialmente al amanecer.'],
            ['David Salazar', 'david.salazar@catalogo-aves.local', 'user', 'Pereira, Colombia', 'Aficionado a los colibríes y a registrar cantos de aves.'],
            ['Natalia Vélez', 'natalia.velez@catalogo-aves.local', 'user', 'Ibagué, Colombia', 'Naturalista de fin de semana y amante de las caminatas lentas.'],
            ['Camilo Duarte', 'camilo.duarte@catalogo-aves.local', 'user', 'Tunja, Colombia', 'Registro aves de páramo y participo en salidas de ciencia ciudadana.'],
            ['Sara Molina', 'sara.molina@catalogo-aves.local', 'user', 'Villa de Leyva, Colombia', 'Interesada en migratorias y conservación de paisajes secos.'],
            ['Juan Esteban Gil', 'juan.gil@catalogo-aves.local', 'admin', 'Bogotá, Colombia', 'Administrador de la comunidad y responsable de operaciones.'],
            ['Valeria Muñoz', 'valeria.munoz@catalogo-aves.local', 'user', 'Santander, Colombia', 'Aves, ilustración naturalista y recorridos de río.'],
            ['Andrés Nieto', 'andres.nieto@catalogo-aves.local', 'user', 'Leticia, Colombia', 'Observador amazónico y defensor de la observación responsable.'],
        ];

        foreach ($people as $index => [$name, $email, $role, $location, $bio]) {
            $id = $this->externalId($index + 1);

            /*
             * El identificador estable representa a la persona de demostración. Buscar por
             * correo O por id permite renombrar el dominio del proyecto sin que una segunda
             * ejecución intente insertar el mismo id primario con un correo nuevo.
             */
            $person = User::query()
                ->where('email', $email)
                ->orWhere('id', $id)
                ->firstOrNew();

            $person->fill([
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('CatalogoAvesPass2026!'),
                'role' => $role,
                'bio' => $bio,
                'general_location' => $location,
                'privacy_settings' => ['show_general_location' => true, 'share_activity' => true],
                'preferences' => ['language' => 'es-CO', 'units' => 'metric', 'weekly_digest' => true],
                'email_verified_at' => $now,
            ]);
            $person->save();
        }

        // Una cuenta predecible permite usar un clon local nuevo inmediatamente. Este seeder
        // de desarrollo nunca la aprovisiona fuera de APP_ENV=local; las credenciales de
        // producción deben administrarse explícitamente.
        if (app()->environment('local')) {
            $superadmin = config('catalogo_aves.local_superadmin');
            User::updateOrCreate(
                ['email' => $superadmin['email']],
                [
                    'name' => $superadmin['name'],
                    'password' => Hash::make($superadmin['password']),
                    'role' => 'superadmin',
                    'email_verified_at' => $now,
                ],
            );
        }
    }

    /** Devuelve el identificador determinista de cada perfil de demostración. */
    private function externalId(int $number): string
    {
        return '01J' . str_pad((string) $number, 23, '0', STR_PAD_LEFT);
    }
}
