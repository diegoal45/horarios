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
        // Solo jefe puede crear turnos
        list($ok, $response) = AuthHelper::checkRole(['jefe']);
        if (!$ok) return $response;
        $shift = Shift::create($request->validated());
        return response()->json($shift, 201);
    }

    public function update(UpdateRequest $request, $id): JsonResponse
    {
        // Solo jefe puede editar turnos
        list($ok, $response) = AuthHelper::checkRole(['jefe']);
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
        // Solo jefe puede eliminar turnos
        list($ok, $response) = AuthHelper::checkRole(['jefe']);
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
}
