<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la proyección API de un avistamiento. Las coordenadas privadas requieren una inclusión
 * explícita del endpoint de dueño/moderación, impidiendo exponerlas accidentalmente en mapas.
 */
class SightingResource extends JsonResource
{
    /** Mantiene respuestas de recurso único compatibles con el contrato REST existente. */
    public static $wrap = null;

    public function __construct(mixed $resource, private readonly bool $includePrivateLocation = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $projection = [
            'id' => $this->id,
            'species_id' => $this->species_id,
            'observed_at' => $this->observed_at,
            'individuals' => $this->individuals,
            'behavior' => $this->behavior,
            'status' => $this->status,
            'sensitivity' => $this->sensitivity,
            'latitude' => $this->public_lat,
            'longitude' => $this->public_lng,
            'region' => $this->includePrivateLocation ? $this->private_region : $this->public_region,
        ];

        // La proyección pública no contiene una clave privada vacía ni valores latentes.
        if ($this->includePrivateLocation) {
            $projection['notes'] = $this->notes;
            $projection['private_location'] = [
                'latitude' => $this->private_lat,
                'longitude' => $this->private_lng,
            ];
        }

        return $projection;
    }
}
