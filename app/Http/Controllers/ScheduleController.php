<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\User;
use App\Http\Requests\Schedule\CreateRequest;
use App\Http\Requests\Schedule\UpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        // Solo administrador y jefe pueden ver todos los horarios
        if (!in_array($user->role, ['administrador', 'jefe'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $schedules = Schedule::with('user', 'shifts')->get();
        return response()->json($schedules);
    }

    public function show($id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $schedule = Schedule::with('user', 'shifts')->find($id);
        if (!$schedule) {
            throw new ModelNotFoundException('Horario no encontrado');
        }
        // Solo administrador, jefe o el propio trabajador pueden ver el horario
        if (!in_array($user->role, ['administrador', 'jefe']) && $user->id !== $schedule->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json($schedule);
    }

    public function store(CreateRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        // Solo jefe puede crear horarios
        if ($user->role !== 'jefe') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $schedule = Schedule::create($request->validated());
        return response()->json($schedule, 201);
    }

    public function update(UpdateRequest $request, $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $schedule = Schedule::find($id);
        if (!$schedule) {
            throw new ModelNotFoundException('Horario no encontrado');
        }
        // Solo jefe puede editar horarios
        if ($user->role !== 'jefe') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $schedule->update($request->validated());
        return response()->json($schedule);
    }

    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $schedule = Schedule::find($id);
        if (!$schedule) {
            throw new ModelNotFoundException('Horario no encontrado');
        }
        // Solo jefe puede eliminar horarios
        if ($user->role !== 'jefe') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $schedule->delete();
        return response()->json(['message' => 'Horario eliminado']);
    }

    // Generar horarios automáticos para 6 trabajadores
    public function generate(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        // Solo jefe puede generar horarios
        if ($user->role !== 'jefe') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Configuración
        $dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
        $horaApertura = '07:00:00';
        $horaCierre = '19:00:00';
        $duracionTurno = 7; // horas
        $trabajadores = \App\Models\User::where('role', 'trabajador')->get();
        if ($trabajadores->count() < 6) {
            return response()->json(['message' => 'Se requieren al menos 6 trabajadores.'], 422);
        }

        // Calcular inicio de semana (lunes actual o siguiente)
        $now = now();
        $weekStart = $now->copy()->startOfWeek();

        // Eliminar horarios y turnos de la semana actual
        $trabajadorIds = $trabajadores->pluck('id');
        $schedules = \App\Models\Schedule::whereIn('user_id', $trabajadorIds)
            ->where('week_start', $weekStart->toDateString())
            ->get();
        foreach ($schedules as $schedule) {
            $schedule->shifts()->delete();
            $schedule->delete();
        }

        // Inicializar contadores de horas semanales
        $horasSemanales = array_fill_keys($trabajadorIds->all(), 0);

        // Para cada trabajador, crear su horario semanal
        $schedulesMap = [];
        foreach ($trabajadores as $trabajador) {
            $schedulesMap[$trabajador->id] = \App\Models\Schedule::create([
                'user_id' => $trabajador->id,
                'week_start' => $weekStart->toDateString(),
                'total_hours' => 0,
            ]);
        }

        // Generar turnos para cada día
        $turnosPorDia = [];
        foreach ($dias as $dia) {
            // Mezclar trabajadores para aleatoriedad
            $ids = $trabajadorIds->shuffle()->values();
            // Asignar apertura (1) y cierre (2)
            $aperturaId = $ids[0];
            $cierreIds = [$ids[1], $ids[2]];

            // Asignar apertura
            if ($horasSemanales[$aperturaId] + $duracionTurno <= 44) {
                $start = $horaApertura;
                $end = date('H:i:s', strtotime($start) + $duracionTurno * 3600);
                $schedulesMap[$aperturaId]->shifts()->create([
                    'day_of_week' => $dia,
                    'start_time' => $start,
                    'end_time' => $end,
                    'is_opening' => true,
                    'is_closing' => false,
                    'hours' => $duracionTurno,
                ]);
                $horasSemanales[$aperturaId] += $duracionTurno;
            }

            // Asignar cierres
            foreach ($cierreIds as $cid) {
                if ($horasSemanales[$cid] + $duracionTurno <= 44) {
                    $end = $horaCierre;
                    $start = date('H:i:s', strtotime($end) - $duracionTurno * 3600);
                    $schedulesMap[$cid]->shifts()->create([
                        'day_of_week' => $dia,
                        'start_time' => $start,
                        'end_time' => $end,
                        'is_opening' => false,
                        'is_closing' => true,
                        'hours' => $duracionTurno,
                    ]);
                    $horasSemanales[$cid] += $duracionTurno;
                }
            }
        }

        // Actualizar total_hours en cada schedule
        foreach ($schedulesMap as $tid => $schedule) {
            $schedule->total_hours = $horasSemanales[$tid];
            $schedule->save();
        }

        return response()->json(['message' => 'Horarios generados automáticamente para la semana actual.']);
    }

    // Publicar horarios (ejemplo: cambiar un estado o notificar)
    public function publish($id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $schedule = Schedule::find($id);
        if (!$schedule) {
            throw new ModelNotFoundException('Horario no encontrado');
        }
        // Solo jefe puede publicar horarios
        if ($user->role !== 'jefe') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        // Aquí iría la lógica para publicar el horario (por ejemplo, cambiar un campo published a true)
        // $schedule->published = true; $schedule->save();
        return response()->json(['message' => 'Horario publicado (implementación pendiente)']);
    }

    // Visualizar total de horas trabajadas por usuario
    public function totalHours($userId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        // Solo jefe, admin o el propio trabajador pueden ver las horas
        if (!in_array($user->role, ['administrador', 'jefe']) && $user->id != $userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $total = Schedule::where('user_id', $userId)->sum('total_hours');
        return response()->json(['user_id' => $userId, 'total_hours' => $total]);
    }
}
