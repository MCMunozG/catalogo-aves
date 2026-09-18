<?php
namespace App\Http\Controllers;
use App\Models\BirdingRoute;
use App\Models\Place;
use Illuminate\Http\Request;
/** Expone el inventario público de lugares y recorridos para la planificación. */
class PlanningController extends Controller {
    public function places() { return Place::query()->where('is_public', true)->orderBy('name')->get(); }
    public function routes(Request $request) { $query = BirdingRoute::query()->where('is_public', true)->orderBy('name'); if ($request->filled('place_id')) $query->where('place_id', $request->string('place_id')); return $query->get(); }
}
