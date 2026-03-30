<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\DebugController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
});

// Debug routes only for non-production environments
if (config('app.debug')) {
    Route::get('/debug/check-data', [DebugController::class, 'checkData']);
    Route::get('/debug/fix-team-members', [DebugController::class, 'fixTeamMembers']);
}



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
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    });

    Route::put('user/profile', function (\Illuminate\Http\Request $request) {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if (!empty($validated['password'])) {
            if (empty($validated['current_password'])) {
                return response()->json([
                    'message' => 'Debes ingresar tu contraseña actual para cambiar la contraseña.',
                ], 422);
            }

            if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual no es correcta.',
                ], 422);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    });

    // Teams - Solo jefes pueden gestionar equipos
    // Teams - Solo administradores pueden crear, editar y eliminar
    Route::middleware('role:administrador')->group(function () {
        Route::post('teams', [TeamController::class, 'store']);
        Route::put('teams/{team}', [TeamController::class, 'update']);
        Route::delete('teams/{team}', [TeamController::class, 'destroy']);
    });
    
    // Agregar/quitar miembros - Solo autenticados, validación por rol en controlador
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('teams/{team}/members', [TeamController::class, 'addMember']);
        Route::delete('teams/{team}/members', [TeamController::class, 'removeMember']);
    });
    
    // Todos pueden ver equipos
    Route::get('teams', [TeamController::class, 'index']);
    Route::get('teams/{team}', [TeamController::class, 'show']);
    Route::get('teams/{team}/members', [TeamController::class, 'getMembers']);
    Route::get('teams/{team}/schedules', [TeamController::class, 'getTeamSchedules']);
    Route::get('my-teams', [TeamController::class, 'getUserTeams']);
    Route::get('led-teams', [TeamController::class, 'getLedTeams']);

    // Métodos personalizados de schedules (ANTES que apiResource)
    Route::get('my-schedules', [ScheduleController::class, 'mySchedules']);
    Route::get('users/{userId}/schedules', [ScheduleController::class, 'userSchedules']);
    Route::post('schedules/generate', [ScheduleController::class, 'generate']);
    Route::post('schedules/publish', [ScheduleController::class, 'publish']);
    Route::get('schedules/user/{userId}/total-hours', [ScheduleController::class, 'totalHours']);

    // CRUD de schedules
    Route::apiResource('schedules', ScheduleController::class);

    // CRUD de shifts
    Route::post('shifts/bulk-update', [ShiftController::class, 'bulkUpdate']);
    Route::apiResource('shifts', ShiftController::class);
    // Turnos del trabajador autenticado
    Route::get('my-shifts', [ShiftController::class, 'myShifts']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('users', [ReportController::class, 'exportUsers']);
        Route::get('schedules', [ReportController::class, 'exportSchedules']);
        Route::get('access-log', [ReportController::class, 'getAccessLog']);
        Route::get('statistics', [ReportController::class, 'getStatistics']);
        Route::get('team-schedules-pdf', [ReportController::class, 'downloadTeamSchedulesPdf']);
    });
});
