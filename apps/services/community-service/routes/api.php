<?php

use App\Http\Controllers\CommunityController;
use Illuminate\Support\Facades\Route;

// Contrato HTTP de Community: el feed público no revela identidad autenticada; las mutaciones sí la exigen.
Route::prefix('community/v1')->group(function () {
    Route::get('health', fn() => ['status' => 'ok', 'service' => 'community-service']);
    Route::get('feed', [CommunityController::class, 'feed']);
    Route::get('posts/{post}/comments', [CommunityController::class, 'comments']);
    Route::middleware('jwt')->group(function () {
        Route::post('posts', [CommunityController::class, 'post']);
        Route::post('posts/{post}/comments', [CommunityController::class, 'comment']);
        Route::put('posts/{post}/reaction', [CommunityController::class, 'react']);
        Route::delete('posts/{post}/reaction', [CommunityController::class, 'removeReaction']);
        Route::put('follows/{user}', [CommunityController::class, 'follow']);
        Route::post('reports', [CommunityController::class, 'report']);
        Route::post('reports/{report}/moderate', [CommunityController::class, 'moderation']);
        Route::get('notifications', [CommunityController::class, 'notifications']);
        Route::put('notifications/read-all', [CommunityController::class, 'readAllNotifications']);
        Route::put('notifications/{notification}/read', [CommunityController::class, 'readNotification']);
    });
});
