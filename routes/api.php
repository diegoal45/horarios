<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShiftController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('user/profile', function (\Illuminate\Http\Request $request) {
        return response()->json($request->user());
    });

    // CRUD de schedules
    Route::apiResource('schedules', ScheduleController::class);
    // Métodos personalizados
    Route::post('schedules/generate', [ScheduleController::class, 'generate']);
    Route::post('schedules/{id}/publish', [ScheduleController::class, 'publish']);
    Route::get('schedules/user/{userId}/total-hours', [ScheduleController::class, 'totalHours']);

    // CRUD de shifts
    Route::apiResource('shifts', ShiftController::class);
    // Turnos del trabajador autenticado
    Route::get('my-shifts', [ShiftController::class, 'myShifts']);


});
