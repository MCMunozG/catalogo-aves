<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/** Recorrido público asociado a un lugar, con su punto de inicio visible. */
class BirdingRoute extends Model
{
    use HasUlids;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'place_id', 'name', 'difficulty', 'duration_minutes', 'distance_km', 'description', 'start_latitude', 'start_longitude', 'is_public'];
}
