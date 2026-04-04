<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DeliveryStatusController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\ProofOfDeliveryController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/track', [DeliveryController::class, 'publicTrack']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']);

    // Statistics
    Route::get('/statistics', [DeliveryController::class, 'statistics']);

    // Deliveries
    Route::apiResource('deliveries', DeliveryController::class);
    Route::patch('/deliveries/{delivery}/status', [DeliveryStatusController::class, 'update']);

    // Tracking
    Route::post('/deliveries/{delivery}/track', [TrackingController::class, 'store']);
    Route::get('/deliveries/{delivery}/track', [TrackingController::class, 'history']);

    // Photos
    Route::post('/deliveries/{delivery}/photos', [PhotoController::class, 'store']);
    Route::delete('/deliveries/{delivery}/photos/{photo}', [PhotoController::class, 'destroy']);

    // Proof of Delivery
    Route::post('/deliveries/{delivery}/proof', [ProofOfDeliveryController::class, 'store']);
    Route::get('/deliveries/{delivery}/proof', [ProofOfDeliveryController::class, 'show']);

    // Users (admin only)
    Route::middleware('role:super-admin|admin-operasional')->group(function () {
        Route::apiResource('users', UserController::class)->except(['show']);
    });
    Route::get('/drivers', [UserController::class, 'drivers']);
});