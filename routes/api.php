<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TeamController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
});



Route::middleware('auth:sanctum')->group(function () {
    // Solo administradores pueden crear, actualizar o eliminar usuarios
    Route::middleware('role:administrador')->group(function () {
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);
        Route::get('users/{id}', [UserController::class, 'show']);
    });
    
    // Todos los autenticados pueden listar usuarios (con filtros según rol)
    Route::get('users', [UserController::class, 'index']);
    
    Route::get('user/profile', function (\Illuminate\Http\Request $request) {
        return response()->json($request->user());
    });

    // Teams - Solo jefes pueden gestionar equipos
    Route::middleware('role:jefe,administrador')->group(function () {
        Route::post('teams', [TeamController::class, 'store']);
        Route::put('teams/{team}', [TeamController::class, 'update']);
        Route::delete('teams/{team}', [TeamController::class, 'destroy']);
        Route::post('teams/{team}/members', [TeamController::class, 'addMember']);
        Route::delete('teams/{team}/members', [TeamController::class, 'removeMember']);
    });
    
    // Todos pueden ver equipos
    Route::get('teams', [TeamController::class, 'index']);
    Route::get('teams/{team}', [TeamController::class, 'show']);
    Route::get('teams/{team}/members', [TeamController::class, 'getMembers']);
    Route::get('my-teams', [TeamController::class, 'getUserTeams']);
    Route::get('led-teams', [TeamController::class, 'getLedTeams']);

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

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('users', [ReportController::class, 'exportUsers']);
        Route::get('schedules', [ReportController::class, 'exportSchedules']);
        Route::get('access-log', [ReportController::class, 'getAccessLog']);
        Route::get('statistics', [ReportController::class, 'getStatistics']);
    });
});
