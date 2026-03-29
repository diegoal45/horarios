<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Http\Requests\Shift\CreateRequest;
use App\Http\Requests\Shift\UpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use App\Helpers\AuthHelper;

class ShiftController extends Controller
{
    public function index(): JsonResponse
    {
        // Solo jefe y admin pueden ver todos los turnos
        list($ok, $response) = AuthHelper::checkRole(['administrador', 'jefe']);
        if (!$ok) return $response;
        $shifts = Shift::with('schedule')->get();
        return response()->json($shifts);
    }

    public function show($id): JsonResponse
    {
        $shift = Shift::with('schedule')->find($id);
        if (!$shift) {
            throw new ModelNotFoundException('Turno no encontrado');
        }
        $user = Auth::user();
        // Solo admin, jefe o el trabajador dueño del horario pueden ver el turno
        if (!in_array($user->role, ['administrador', 'jefe']) && $user->id !== $shift->schedule->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json($shift);
    }

    public function store(CreateRequest $request): JsonResponse
    {
        // Admin o jefe puede crear turnos
        list($ok, $response) = AuthHelper::checkRole(['administrador', 'jefe']);
        if (!$ok) return $response;
        $shift = Shift::create($request->validated());
        return response()->json($shift, 201);
    }

    public function update(UpdateRequest $request, $id): JsonResponse
    {
        // Admin o jefe pueden editar turnos
        list($ok, $response) = AuthHelper::checkRole(['administrador', 'jefe']);
        if (!$ok) return $response;
        $shift = Shift::find($id);
        if (!$shift) {
            throw new ModelNotFoundException('Turno no encontrado');
        }
        $shift->update($request->validated());
        return response()->json($shift);
    }

    public function destroy($id): JsonResponse
    {
        // Admin o jefe pueden eliminar turnos
        list($ok, $response) = AuthHelper::checkRole(['administrador', 'jefe']);
        if (!$ok) return $response;
        $shift = Shift::find($id);
        if (!$shift) {
            throw new ModelNotFoundException('Turno no encontrado');
        }
        $shift->delete();
        return response()->json(['message' => 'Turno eliminado']);
    }

    // Listar turnos de un trabajador autenticado
    public function myShifts(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $shifts = Shift::whereHas('schedule', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('schedule')->get();
        return response()->json($shifts);
    }

    // Actualizar múltiples shifts en una sola petición
    public function bulkUpdate(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Solo jefe y admin pueden editar
        if (!in_array($user->role, ['jefe', 'administrador'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $shifts = $request->input('shifts', []);
        if (empty($shifts)) {
            return response()->json(['message' => 'No hay turnos para actualizar'], 422);
        }

        $updated = 0;
        $errors = [];

        foreach ($shifts as $shiftData) {
            try {
                $shift = Shift::find($shiftData['id']);
                if (!$shift) {
                    $errors[] = "Turno {$shiftData['id']} no encontrado";
                    continue;
                }

                // Validar horas
                $start = strtotime($shiftData['start_time']);
                $end = strtotime($shiftData['end_time']);
                if ($end <= $start) {
                    $errors[] = "Turno {$shiftData['id']}: Hora fin debe ser después de hora inicio";
                    continue;
                }

                $hours = round(($end - $start) / 3600);
                if ($hours > 7) {
                    $errors[] = "Turno {$shiftData['id']}: No puede exceder 7 horas";
                    continue;
                }

                $shift->update([
                    'start_time' => $shiftData['start_time'] . ':00',
                    'end_time' => $shiftData['end_time'] . ':00',
                    'hours' => $hours
                ]);

                $updated++;
            } catch (\Exception $e) {
                $errors[] = "Error actualizando turno {$shiftData['id']}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => "$updated turnos actualizados",
            'updated' => $updated,
            'errors' => $errors
        ]);
    }
}
