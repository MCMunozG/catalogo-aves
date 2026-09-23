<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/** Registro fuente privado junto con una proyección de ubicación pública persistida por separado. */
class Sighting extends Model
{
    use HasUlids;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['user_id', 'species_id', 'observed_at', 'individuals', 'behavior', 'notes', 'status', 'sensitivity', 'private_lat', 'private_lng', 'private_region', 'public_lat', 'public_lng', 'public_region'];
    /** @return array<string, string> Garantiza que la hora de observación se trate como un objeto de fecha. */

    protected function casts(): array
    {
        return ['observed_at' => 'datetime'];
    }
}
