<?php

namespace Database\Seeders;

use App\Models\Species;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        Species::whereIn('scientific_name', ['Momotus aequatorialis', 'Aquila demonstrativa', 'Ave protegida demostrativa'])->delete();
        $species = [
            ['Barranquero andino', 'Momotus aequatorialis', 'Bosques andinos, bordes de bosque y jardines arbolados.', 'Ave robusta de cola larga que suele permanecer quieta en perchas bajas.', '42–48 cm', 'Insectos, pequeños vertebrados y frutos.', 'Andes del norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Tángara azuleja', 'Thraupis episcopus', 'Jardines, parques, bordes de bosque y zonas semiabiertas.', 'Tángara azul grisácea común en paisajes intervenidos.', '16–18 cm', 'Frutos, néctar e insectos.', 'Desde Centroamérica hasta el norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Colibrí colirrufo', 'Amazilia tzacatl', 'Jardines floridos, cafetales y bordes de bosque.', 'Colibrí verde con cola rojiza, activo alrededor de flores bajas y medias.', '9–11 cm', 'Néctar y pequeños artrópodos.', 'México, Centroamérica y norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Colibrí chillón', 'Colibri coruscans', 'Bosques montanos, claros y jardines de altura.', 'Colibrí grande de tonos verdes que se reconoce con frecuencia por sus vocalizaciones agudas.', '13–14 cm', 'Néctar e insectos.', 'Andes desde Venezuela hasta Bolivia.', 'Preocupación menor (LC)', 'EXACT'],
            ['Oropéndola crestada', 'Psarocolius decumanus', 'Bordes de bosque, cultivos, potreros arbolados y tierras bajas.', 'Ictérido grande y oscuro con rabadilla amarilla, visible en colonias colgantes.', '42–47 cm', 'Frutos, insectos y néctar.', 'Centroamérica y norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Garrapatero común', 'Crotophaga ani', 'Pastizales, áreas agrícolas, matorrales y bordes de humedal.', 'Ave negra de cola larga que se desplaza en grupos pequeños.', '32–36 cm', 'Insectos, arañas y pequeños vertebrados.', 'Américas tropicales.', 'Preocupación menor (LC)', 'EXACT'],
            ['Garceta nívea', 'Egretta thula', 'Humedales, lagunas, ríos lentos y zonas inundables.', 'Garza blanca pequeña de patas oscuras y pies amarillos.', '56–66 cm', 'Peces, crustáceos e invertebrados acuáticos.', 'América, con movimientos estacionales regionales.', 'Preocupación menor (LC)', 'EXACT'],
            ['Pisingo', 'Dendrocygna autumnalis', 'Lagunas, arrozales, pantanos y humedales con vegetación emergente.', 'Pato de cuello largo, frecuente en grupos ruidosos al amanecer y atardecer.', '45–53 cm', 'Semillas, plantas acuáticas e invertebrados.', 'Sur de Estados Unidos, Centroamérica y norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Sirirí común', 'Tyrannus melancholicus', 'Áreas abiertas con árboles dispersos, potreros y ciudades.', 'Mosquero amarillo de cabeza gris que caza desde perchas expuestas.', '21–23 cm', 'Insectos capturados al vuelo y frutos.', 'Desde México hasta Argentina.', 'Preocupación menor (LC)', 'EXACT'],
            ['Bichofué gritón', 'Pitangus sulphuratus', 'Parques, jardines, riberas y paisajes abiertos.', 'Mosquero de vientre amarillo y antifaz oscuro, conocido por su voz fuerte.', '21–26 cm', 'Insectos, frutos y pequeños vertebrados.', 'Desde Texas hasta Argentina.', 'Preocupación menor (LC)', 'EXACT'],
            ['Mirla patinaranja', 'Turdus fuscater', 'Bosques montanos, parques y jardines andinos.', 'Mirla grande y oscura, frecuente en céspedes y árboles frutales de altura.', '27–30 cm', 'Frutos, lombrices e insectos.', 'Andes del norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Copetón', 'Zonotrichia capensis', 'Pastizales, jardines, matorrales y áreas urbanas de montaña.', 'Gorrión de ceja clara y copete listado, habitual cerca del suelo.', '14–15 cm', 'Semillas, brotes e insectos.', 'Centroamérica y gran parte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Torito cabecirrojo', 'Eubucco bourcierii', 'Bosques húmedos montanos y bordes con vegetación densa.', 'Barbudo pequeño y colorido que se alimenta en el sotobosque y estrato medio.', '14–16 cm', 'Frutos e insectos.', 'Andes desde Venezuela hasta Ecuador.', 'Preocupación menor (LC)', 'APPROXIMATE'],
            ['Gallito de roca andino', 'Rupicola peruvianus', 'Bosques húmedos de montaña, quebradas y barrancos.', 'El macho es naranja intenso; ambos sexos usan áreas de exhibición en bosque maduro.', '30–32 cm', 'Principalmente frutos.', 'Andes de Venezuela, Colombia, Ecuador, Perú y Bolivia.', 'Preocupación menor (LC)', 'APPROXIMATE'],
            ['Pava andina', 'Penelope montagnii', 'Bosques nublados y bordes de bosque altoandino.', 'Crácido de tamaño mediano que suele moverse con cautela entre el dosel y los bordes.', '55–65 cm', 'Frutos, hojas y brotes.', 'Andes desde Venezuela hasta Bolivia.', 'Preocupación menor (LC)', 'APPROXIMATE'],
            ['Loro orejiamarillo', 'Ognorhynchus icterotis', 'Bosques altoandinos y paisajes asociados a palma de cera.', 'Loro de montaña con manchas amarillas en la cara, ligado a bosques conservados.', '40–42 cm', 'Frutos, semillas y brotes.', 'Andes de Colombia y Ecuador.', 'Vulnerable (VU)', 'HIDDEN'],
            ['Cóndor andino', 'Vultur gryphus', 'Páramos, alta montaña, cañones y áreas abiertas andinas.', 'Gran buitre planeador, asociado a paisajes abiertos de alta elevación.', '100–130 cm', 'Carroña.', 'Cordillera de los Andes y costa pacífica austral.', 'Vulnerable (VU)', 'HIDDEN'],
            ['Águila crestada', 'Morphnus guianensis', 'Bosques húmedos de tierras bajas y piedemonte bien conservados.', 'Rapaz forestal grande y poco común, difícil de observar fuera de bosque continuo.', '71–89 cm', 'Pequeños mamíferos, aves y reptiles.', 'Desde Centroamérica hasta la Amazonia.', 'Casi amenazada (NT)', 'HIDDEN'],
            ['Reinita crestinegra', 'Myiothlypis nigrocristata', 'Bosques andinos húmedos, bordes y matorrales de altura.', 'Reinita activa de tonos amarillos y oliva que busca alimento en vegetación baja.', '13–14 cm', 'Insectos y otros artrópodos.', 'Andes de Venezuela, Colombia y Ecuador.', 'Preocupación menor (LC)', 'APPROXIMATE'],
            ['Cacique candela', 'Hypopyrrhus pyrohypogaster', 'Bosques montanos húmedos y bordes arbolados de los Andes centrales.', 'Ictérido negro con rojo intenso, endémico de Colombia.', '25–28 cm', 'Frutos, néctar e insectos.', 'Andes centrales de Colombia.', 'Vulnerable (VU)', 'HIDDEN'],
            ['Tangara rastrojera', 'Stilpnia vitriolina', 'Matorrales, jardines, cultivos y bordes de bosque andino.', 'Tángara vistosa y frecuente en áreas abiertas de los Andes colombianos.', '13–14 cm', 'Frutos pequeños e insectos.', 'Andes de Colombia y Ecuador.', 'Preocupación menor (LC)', 'EXACT'],
            ['Carpintero lineado', 'Dryocopus lineatus', 'Bosques, arboledas urbanas, potreros con árboles y bordes.', 'Carpintero grande con cresta roja que tamborilea en troncos expuestos.', '33–36 cm', 'Larvas, hormigas y otros insectos de madera.', 'Desde México hasta el norte de Argentina.', 'Preocupación menor (LC)', 'EXACT'],
            ['Semillero capuchino', 'Sporophila nigricollis', 'Pastizales, cultivos y bordes de humedal.', 'Semillero pequeño de pico grueso, usualmente observado en hierbas altas.', '10–11 cm', 'Semillas de gramíneas e insectos pequeños.', 'Centroamérica y norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
            ['Tangara palmera', 'Thraupis palmarum', 'Palmares, jardines, zonas abiertas y bordes de bosque.', 'Tángara oliva que forrajea en grupos y visita árboles frutales.', '18–20 cm', 'Frutos, flores e insectos.', 'Centroamérica y norte de Suramérica.', 'Preocupación menor (LC)', 'EXACT'],
        ];

        $rows = [];
        foreach ($species as $index => [$common, $scientific, $habitat, $description, $size, $feeding, $distribution, $status, $sensitivity]) {
            $rows[] = [
                'id' => $this->externalId(101 + $index),
                'common_name' => $common,
                'scientific_name' => $scientific,
                'taxonomy' => json_encode(['class' => 'Aves', 'order' => 'Consulta taxonomía especializada para clasificación actualizada'], JSON_UNESCAPED_UNICODE),
                'description' => $description,
                'size' => $size,
                'habitat' => $habitat,
                'feeding' => $feeding,
                'distribution' => $distribution,
                'typical_hours' => json_encode(['Amanecer', 'Mañana', 'Tarde'], JSON_UNESCAPED_UNICODE),
                'seasons' => json_encode(['Residente o presencia regional según la especie'], JSON_UNESCAPED_UNICODE),
                'similar_species' => json_encode([]),
                'distinguishing_features' => 'Revisar forma, tamaño, patrón de plumaje, comportamiento y vocalización antes de confirmar una identificación.',
                'conservation_status' => $status,
                'sensitivity' => $sensitivity,
                'is_published' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        Species::upsert($rows, ['scientific_name'], ['common_name', 'taxonomy', 'description', 'size', 'habitat', 'feeding', 'distribution', 'typical_hours', 'seasons', 'similar_species', 'distinguishing_features', 'conservation_status', 'sensitivity', 'is_published', 'updated_at']);
    }

    private function externalId(int $number): string
    {
        return '01J' . str_pad((string) $number, 23, '0', STR_PAD_LEFT);
    }
}
