<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $species = [
            ['Barranquero andino', 'EXACT'],
            ['Tángara azuleja', 'EXACT'],
            ['Colibrí colirrufo', 'EXACT'],
            ['Colibrí chillón', 'EXACT'],
            ['Oropéndola crestada', 'EXACT'],
            ['Garrapatero común', 'EXACT'],
            ['Garceta nívea', 'EXACT'],
            ['Pisingo', 'EXACT'],
            ['Sirirí común', 'EXACT'],
            ['Bichofué gritón', 'EXACT'],
            ['Mirla patinaranja', 'EXACT'],
            ['Copetón', 'EXACT'],
            ['Torito cabecirrojo', 'APPROXIMATE'],
            ['Gallito de roca andino', 'APPROXIMATE'],
            ['Pava andina', 'APPROXIMATE'],
            ['Loro orejiamarillo', 'HIDDEN'],
            ['Cóndor andino', 'HIDDEN'],
            ['Águila crestada', 'HIDDEN'],
            ['Reinita crestinegra', 'APPROXIMATE'],
            ['Cacique candela', 'HIDDEN'],
            ['Tangara rastrojera', 'EXACT'],
            ['Carpintero lineado', 'EXACT'],
            ['Semillero capuchino', 'EXACT'],
            ['Tangara palmera', 'EXACT'],
        ];
        $behaviors = ['Forrajeando en el dosel', 'Vocalizando desde una percha', 'En pareja', 'En grupo pequeño', 'Alimentándose de frutos', 'En vuelo bajo', 'Explorando vegetación densa', 'Descansando en una rama expuesta'];
        $regions = ['Bosque andino', 'Humedal urbano', 'Borde de reserva', 'Sendero de niebla', 'Parque arbolado', 'Quebrada de montaña'];

        foreach (range(0, 59) as $index) {
            [$name, $sensitivity] = $species[$index % count($species)];
            $latitude = 4.58 + (($index * 37) % 91) / 1000;
            $longitude = -74.16 + (($index * 53) % 119) / 1000;
            $status = $index % 13 === 0 ? 'NEEDS_IDENTIFICATION' : ($index % 17 === 0 ? 'VERIFIED' : 'PUBLISHED');
            $publicLat = $sensitivity === 'HIDDEN' ? null : ($sensitivity === 'APPROXIMATE' ? round($latitude / 0.05) * 0.05 : $latitude);
            $publicLng = $sensitivity === 'HIDDEN' ? null : ($sensitivity === 'APPROXIMATE' ? round($longitude / 0.05) * 0.05 : $longitude);

            DB::table('sightings')->updateOrInsert(
                ['id' => $this->externalId(5001 + $index)],
                [
                    'user_id' => $this->externalId(1 + ($index % 12)),
                    'species_id' => $this->externalId(101 + ($index % count($species))),
                    'observed_at' => $now->copy()->subDays(($index * 3) % 120)->subMinutes(($index * 19) % 360),
                    'individuals' => 1 + ($index % 7),
                    'behavior' => $behaviors[$index % count($behaviors)],
                    'notes' => $name . ' registrada durante un recorrido de observación. Se mantuvo distancia y no se alteró el comportamiento del ave.',
                    'status' => $status,
                    'sensitivity' => $sensitivity,
                    'private_lat' => $latitude,
                    'private_lng' => $longitude,
                    'public_lat' => $publicLat,
                    'public_lng' => $publicLng,
                    'public_region' => $sensitivity === 'HIDDEN' ? $regions[$index % count($regions)] : null,
                    'created_at' => $now->copy()->subDays(($index * 3) % 120),
                    'updated_at' => $now,
                ],
            );
        }

        $places = [
            ['Humedal de la sabana', 'Bogotá', 'Bogotá D.C.', 'Humedal urbano', 'Senderos tranquilos para observar garzas, patos y aves de borde.', 4.6658, -74.1056],
            ['Bosque alto de Chingaza', 'La Calera', 'Cundinamarca', 'Bosque andino', 'Bosque de niebla con miradores y vegetación de montaña.', 4.7026, -73.8441],
            ['Parque arbolado del sur', 'Bogotá', 'Bogotá D.C.', 'Parque urbano', 'Un espacio accesible para empezar a reconocer aves comunes.', 4.6047, -74.1012],
        ];

        foreach ($places as $index => [$name, $municipality, $department, $habitat, $description, $latitude, $longitude]) {
            DB::table('places')->updateOrInsert(['id' => $this->externalId(8001 + $index)], compact('name', 'municipality', 'department', 'habitat', 'description', 'latitude', 'longitude') + ['is_public' => true, 'updated_at' => $now, 'created_at' => $now]);
        }

        $routes = [
            ['Mañana de humedal', 8001, 'Fácil', 90, 2.40, 'Un circuito corto y llano para las primeras horas del día.', 4.6658, -74.1056],
            ['Sendero del bosque alto', 8002, 'Moderada', 180, 4.80, 'Recorrido de subida suave para reconocer estratos y cantos.', 4.7026, -73.8441],
            ['Vuelta de parque', 8003, 'Fácil', 60, 1.70, 'Ruta urbana breve, ideal para iniciar una lista personal.', 4.6047, -74.1012],
        ];

        foreach ($routes as $index => [$name, $placeNumber, $difficulty, $duration, $distance, $description, $latitude, $longitude]) {
            DB::table('birding_routes')->updateOrInsert(['id' => $this->externalId(8101 + $index)], ['place_id' => $this->externalId($placeNumber), 'name' => $name, 'difficulty' => $difficulty, 'duration_minutes' => $duration, 'distance_km' => $distance, 'description' => $description, 'start_latitude' => $latitude, 'start_longitude' => $longitude, 'is_public' => true, 'updated_at' => $now, 'created_at' => $now]);
        }
    }

    /** Crea lugares y rutas reproducibles para que la interfaz sea utilizable tras prepare. */
    private function seedPlanningData($now): void
    {
        $places = [
            ['Humedal de la sabana', 'Bogotá', 'Bogotá D.C.', 'Humedal urbano', 'Senderos tranquilos para observar garzas, patos y aves de borde.', 4.6658, -74.1056],
            ['Bosque alto de Chingaza', 'La Calera', 'Cundinamarca', 'Bosque andino', 'Bosque de niebla con miradores y vegetación de montaña.', 4.7026, -73.8441],
            ['Parque arbolado del sur', 'Bogotá', 'Bogotá D.C.', 'Parque urbano', 'Un espacio accesible para empezar a reconocer aves comunes.', 4.6047, -74.1012],
        ];
        foreach ($places as $index => [$name, $municipality, $department, $habitat, $description, $latitude, $longitude]) {
            DB::table('places')->updateOrInsert(['id' => $this->externalId(8001 + $index)], compact('name', 'municipality', 'department', 'habitat', 'description', 'latitude', 'longitude') + ['is_public' => true, 'updated_at' => $now, 'created_at' => $now]);
        }
        $routes = [['Mañana de humedal', 8001, 'Fácil', 90, 2.4, 'Un circuito corto y llano para las primeras horas del día.', 4.6658, -74.1056], ['Sendero del bosque alto', 8002, 'Moderada', 180, 4.8, 'Recorrido de subida suave para reconocer estratos y cantos.', 4.7026, -73.8441], ['Vuelta de parque', 8003, 'Fácil', 60, 1.7, 'Ruta urbana breve, ideal para iniciar una lista personal.', 4.6047, -74.1012]];
        foreach ($routes as $index => [$name, $placeNumber, $difficulty, $duration, $distance, $description, $latitude, $longitude]) {
            DB::table('birding_routes')->updateOrInsert(['id' => $this->externalId(8101 + $index)], ['place_id' => $this->externalId($placeNumber), 'name' => $name, 'difficulty' => $difficulty, 'duration_minutes' => $duration, 'distance_km' => $distance, 'description' => $description, 'start_latitude' => $latitude, 'start_longitude' => $longitude, 'is_public' => true, 'updated_at' => $now, 'created_at' => $now]);
        }
    }

    private function externalId(int $number): string
    {
        return '01J' . str_pad((string) $number, 23, '0', STR_PAD_LEFT);
    }
}
