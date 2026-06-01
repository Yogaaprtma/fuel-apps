<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DeliveryStatusController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\ProofOfDeliveryController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-2fa', [AuthController::class, 'verify2fa']);
Route::get('/track', [DeliveryController::class, 'publicTrack']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/setup-2fa', [AuthController::class, 'setup2fa']);
    Route::post('/auth/enable-2fa', [AuthController::class, 'enable2fa']);

    // Statistics
    Route::get('/statistics', [DeliveryController::class, 'statistics']);

    // Export CSV - HARUS sebelum apiResource agar tidak tertimpa route {delivery}
    Route::get('/deliveries/export/csv', [DeliveryController::class, 'export']);
    Route::post('/deliveries/optimize-route', [DeliveryController::class, 'optimizeRoute']);


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
    Route::get('/customers', [UserController::class, 'customers']);

    // Rating
    Route::post('/deliveries/{delivery}/rating',  [RatingController::class, 'store']);
    Route::get('/deliveries/{delivery}/rating',   [RatingController::class, 'show']);
    Route::get('/drivers/{driverId}/rating-stats', [RatingController::class, 'driverStats']);

    // Push Notifications
    Route::get('/push/vapid-key',       [PushSubscriptionController::class, 'vapidKey']);
    Route::post('/push/subscribe',      [PushSubscriptionController::class, 'store']);
    Route::post('/push/unsubscribe',    [PushSubscriptionController::class, 'destroy']);
});