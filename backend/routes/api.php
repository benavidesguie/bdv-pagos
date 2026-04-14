<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdenPagoController;
use App\Http\Controllers\WebhookConciliacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Consultar orden de pago por UUID
Route::get('/ordenes-pago/{uuid}', [OrdenPagoController::class, 'show']);

// Webhook de conciliación (llamado desde frontend después de validar con BDV)
Route::post('/webhook-conciliacion', [WebhookConciliacionController::class, 'handle']);

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});
