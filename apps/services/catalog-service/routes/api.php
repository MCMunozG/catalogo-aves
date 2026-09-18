<?php

use App\Http\Controllers\SpeciesController;
use Illuminate\Support\Facades\Route;

// Contrato HTTP de Catalog: lectura pública y edición protegida por JWT y rol editorial.
Route::prefix('catalog/v1')->group(function () {
    Route::get('health', fn() => ['status' => 'ok', 'service' => 'catalog-service']);
    Route::get('species', [SpeciesController::class, 'index']);
    Route::get('species/{species}', [SpeciesController::class, 'show']);
    Route::middleware('jwt')->prefix('admin')->group(function () {
        Route::post('species', [SpeciesController::class, 'store']);
        Route::put('species/{species}', [SpeciesController::class, 'update']);
    });
});
