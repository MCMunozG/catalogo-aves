<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Contrato HTTP versionado de Accounts: autenticación pública, renovación limitada y perfil protegido.
Route::prefix('accounts/v1')->group(function () {
    Route::get('health', fn() => response()->json(['status' => 'ok', 'service' => 'accounts-service']));
    // Limita endpoints que aceptan credenciales para reducir intentos automatizados.
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login', [AuthController::class, 'login']);
        Route::post('auth/refresh', [AuthController::class, 'refresh']);
    });
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('jwt');
    Route::middleware('jwt')->group(function () {
        Route::get('me', [ProfileController::class, 'show']);
        Route::patch('me', [ProfileController::class, 'update']);
    });
});
