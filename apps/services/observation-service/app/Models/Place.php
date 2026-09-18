<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
/** Lugar público apto para descubrir y planear una salida de observación. */
class Place extends Model { use HasUlids; public $incrementing = false; protected $keyType = 'string'; protected $fillable = ['id', 'name', 'municipality', 'department', 'habitat', 'description', 'latitude', 'longitude', 'is_public']; }
