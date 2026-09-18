<?php

use App\Http\Controllers\SightingController;
use App\Http\Controllers\PlanningController;
use Illuminate\Support\Facades\Route;

// Contrato HTTP de Observation: el mapa es público y las proyecciones privadas requieren JWT.
Route::prefix('observations/v1')->group(function () {
    Route::get('health', fn() => ['status' => 'ok', 'service' => 'observation-service']);
    Route::get('map/sightings', [SightingController::class, 'map']);
    Route::get('places', [PlanningController::class, 'places']);
    Route::get('routes', [PlanningController::class, 'routes']);
    Route::middleware('jwt')->group(function () {
        Route::post('sightings', [SightingController::class, 'store']);
        Route::get('sightings/mine', [SightingController::class, 'mine']);
        Route::get('sightings/{s}', [SightingController::class, 'show']);
        Route::put('sightings/{s}', [SightingController::class, 'update']);
        Route::delete('sightings/{s}', [SightingController::class, 'destroy']);
    });
});
