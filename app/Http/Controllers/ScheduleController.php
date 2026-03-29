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

    // Generar horarios automáticos para equipo (debe tener 6 miembros)
    public function generate(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Solo jefe y admin pueden generar horarios
        if (!in_array($user->role, ['jefe', 'administrador'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Obtener el team_id del request
        $teamId = $request->input('team_id');
        if (!$teamId) {
            return response()->json(['message' => 'team_id es requerido'], 422);
        }

        $team = \App\Models\Team::with('members')->find($teamId);
        if (!$team) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        // Validar que el usuario sea el líder del equipo (para jefe) o admin
        if ($user->role === 'jefe' && $team->leader_id !== $user->id) {
            return response()->json(['message' => 'No eres el líder de este equipo'], 403);
        }

        // Validar que el equipo tenga exactamente 6 miembros
        if ($team->members->count() !== 6) {
            return response()->json(
                ['message' => "El equipo debe tener exactamente 6 miembros. Actualmente tiene {$team->members->count()}."],
                422
            );
        }

        // Configuración
        $dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
        $horaApertura = '07:00:00';
        $horaCierre = '19:00:00';
        $duracionTurno = 7; // horas
        $trabajadores = $team->members;
        $trabajadorIds = $trabajadores->pluck('id');

        // Calcular inicio de semana (lunes actual o siguiente)
        $now = now();
        $weekStart = $now->copy()->startOfWeek();

        // Eliminiar horarios y turnos de la semana actual para TODOS los usuarios
        // (no filtrar por team_id porque podría no estar seteado en datos antiguos)
        $existingSchedules = \App\Models\Schedule::whereIn('user_id', $trabajadorIds)
            ->where('week_start', $weekStart->toDateString())
            ->get();
        
        foreach ($existingSchedules as $schedule) {
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
                'team_id' => $team->id,
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

        return response()->json([
            'message' => 'Horarios generados automáticamente para la semana actual.',
            'team_id' => $team->id,
            'week_start' => $weekStart->toDateString(),
            'schedules_count' => count($schedulesMap)
        ]);
    }

    // Publicar horarios de un equipo (todos los schedules de la semana)
    public function publish(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Solo jefe y admin pueden publicar
        if (!in_array($user->role, ['jefe', 'administrador'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Obtener team_id y week_start del request
        $teamId = $request->input('team_id');
        $weekStart = $request->input('week_start');

        if (!$teamId || !$weekStart) {
            return response()->json(['message' => 'team_id y week_start son requeridos'], 422);
        }

        $team = \App\Models\Team::find($teamId);
        if (!$team) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        // Validar que el usuario sea el líder del equipo (para jefe) o admin
        if ($user->role === 'jefe' && $team->leader_id !== $user->id) {
            return response()->json(['message' => 'No eres el líder de este equipo'], 403);
        }

        // Obtener todos los schedules del equipo para la semana
        $schedules = Schedule::where('team_id', $teamId)
            ->where('week_start', $weekStart)
            ->get();

        if ($schedules->isEmpty()) {
            return response()->json(['message' => 'No hay horarios para publicar'], 404);
        }

        // Marcar como publicados
        foreach ($schedules as $schedule) {
            $schedule->update(['published' => true]);
        }

        return response()->json([
            'message' => 'Horarios publicados correctamente',
            'team_id' => $teamId,
            'week_start' => $weekStart,
            'schedules_published' => count($schedules)
        ]);
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

    // Obtener mis propios horarios (del usuario autenticado)
    public function mySchedules(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $schedules = Schedule::with('user', 'shifts')
            ->where('user_id', $user->id)
            ->orderBy('week_start', 'desc')
            ->get();

        // Transform schedules into individual shift records with dates
        $shifts = [];
        foreach ($schedules as $schedule) {
            $weekStart = new \DateTime($schedule->week_start);
            
            // Mapa de días de la semana a índice
            $dayMap = [
                'lunes' => 0,
                'martes' => 1,
                'miércoles' => 2,
                'jueves' => 3,
                'viernes' => 4,
                'sábado' => 5,
                'domingo' => 6,
            ];
            
            foreach ($schedule->shifts as $shift) {
                $shiftDate = clone $weekStart;
                $dayIndex = $dayMap[strtolower($shift->day_of_week)] ?? 0;
                $shiftDate->add(new \DateInterval('P' . $dayIndex . 'D'));
                
                $shifts[] = [
                    'id' => $shift->id,
                    'date' => $shiftDate->format('d/m/Y'),
                    'startTime' => substr($shift->start_time, 0, 5),
                    'endTime' => substr($shift->end_time, 0, 5),
                    'shift' => ucfirst($shift->day_of_week),
                    'status' => 'approved',
                    'hours' => $shift->hours
                ];
            }
        }

        return response()->json($shifts);
    }

    // Obtener horarios de un usuario específico (solo para jefe/admin)
    public function userSchedules($userId): JsonResponse
    {
        $authUser = Auth::user();
        if (!$authUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Solo administrador y jefe pueden ver horarios de otros usuarios
        if (!in_array($authUser->role, ['administrador', 'jefe'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $schedules = Schedule::with('user', 'shifts')
            ->where('user_id', $userId)
            ->orderBy('week_start', 'desc')
            ->get();

        // Transform schedules into individual shift records with dates
        $shifts = [];
        foreach ($schedules as $schedule) {
            $weekStart = new \DateTime($schedule->week_start);
            
            // Mapa de días de la semana a índice
            $dayMap = [
                'lunes' => 0,
                'martes' => 1,
                'miércoles' => 2,
                'jueves' => 3,
                'viernes' => 4,
                'sábado' => 5,
                'domingo' => 6,
            ];
            
            foreach ($schedule->shifts as $shift) {
                $shiftDate = clone $weekStart;
                $dayIndex = $dayMap[strtolower($shift->day_of_week)] ?? 0;
                $shiftDate->add(new \DateInterval('P' . $dayIndex . 'D'));
                
                $shifts[] = [
                    'id' => $shift->id,
                    'date' => $shiftDate->format('d/m/Y'),
                    'startTime' => substr($shift->start_time, 0, 5),
                    'endTime' => substr($shift->end_time, 0, 5),
                    'shift' => ucfirst($shift->day_of_week),
                    'status' => 'approved',
                    'hours' => $shift->hours
                ];
            }
        }

        return response()->json($shifts);
    }
}
