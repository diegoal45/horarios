<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\Team;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Exportar usuarios en formato CSV
     */
    public function exportUsers(Request $request)
    {
        try {
            $users = User::with('roles')->get();
            
            // Crear CSV en memoria
            $headers = [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="usuarios.csv"',
            ];
            
            $callback = function() use ($users) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM
                
                // Headers
                fputcsv($file, ['ID', 'Nombre', 'Email', 'Rol', 'Creado']);
                
                // Datos
                foreach ($users as $user) {
                    $role = $user->roles->first()?->name ?? 'N/A';
                    fputcsv($file, [
                        $user->id,
                        $user->name,
                        $user->email,
                        $role,
                        $user->created_at->format('Y-m-d H:i:s')
                    ]);
                }
                
                fclose($file);
            };
            
            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting users: ' . $e->getMessage());
            return response()->json(['error' => 'Error al exportar usuarios'], 500);
        }
    }

    /**
     * Exportar horarios en formato CSV
     */
    public function exportSchedules(Request $request)
    {
        try {
            $schedules = Schedule::with('user')->get();
            
            $headers = [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="horarios.csv"',
            ];
            
            $callback = function() use ($schedules) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM
                
                // Headers
                fputcsv($file, ['ID', 'Usuario', 'Semana', 'Horas Total', 'Status', 'Creado']);
                
                // Datos
                foreach ($schedules as $schedule) {
                    fputcsv($file, [
                        $schedule->id,
                        $schedule->user?->name ?? 'N/A',
                        $schedule->week_start,
                        $schedule->total_hours,
                        $schedule->status,
                        $schedule->created_at->format('Y-m-d H:i:s')
                    ]);
                }
                
                fclose($file);
            };
            
            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting schedules: ' . $e->getMessage());
            return response()->json(['error' => 'Error al exportar horarios'], 500);
        }
    }

    /**
     * Obtener registro de acceso (bitácora de auditoría)
     */
    public function getAccessLog(Request $request)
    {
        try {
            // Simular log de acceso - Log access activity
            // En una aplicación real, guardaríamos esto en una tabla de auditoría
            $logs = [
                [
                    'id' => 1,
                    'user' => 'Admin',
                    'action' => 'login',
                    'resource' => 'dashboard',
                    'timestamp' => now()->subHours(2)->toDateTimeString(),
                    'ip' => '127.0.0.1'
                ],
                [
                    'id' => 2,
                    'user' => 'Juan Pérez',
                    'action' => 'view',
                    'resource' => 'schedules',
                    'timestamp' => now()->subHours(1)->toDateTimeString(),
                    'ip' => '192.168.1.100'
                ],
                [
                    'id' => 3,
                    'user' => 'Admin',
                    'action' => 'create',
                    'resource' => 'user',
                    'timestamp' => now()->subMinutes(30)->toDateTimeString(),
                    'ip' => '127.0.0.1'
                ],
                [
                    'id' => 4,
                    'user' => 'Jefe',
                    'action' => 'update',
                    'resource' => 'schedule',
                    'timestamp' => now()->subMinutes(15)->toDateTimeString(),
                    'ip' => '192.168.1.105'
                ],
                [
                    'id' => 5,
                    'user' => 'Juan Pérez',
                    'action' => 'export',
                    'resource' => 'schedules',
                    'timestamp' => now()->subMinutes(5)->toDateTimeString(),
                    'ip' => '192.168.1.100'
                ],
            ];

            return response()->json($logs);
        } catch (\Exception $e) {
            Log::error('Error getting access log: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener bitácora de acceso'], 500);
        }
    }

    /**
     * Obtener estadísticas generales
     */
    public function getStatistics(Request $request)
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_schedules' => Schedule::count(),
                'total_shifts' => Shift::count(),
                'users_by_role' => User::join('role_user', 'users.id', '=', 'role_user.user_id')
                    ->join('roles', 'roles.id', '=', 'role_user.role_id')
                    ->select('roles.name', \DB::raw('count(*) as count'))
                    ->groupBy('roles.name')
                    ->get()
                    ->keyBy('name')
                    ->map(fn($item) => $item->count)
                    ->toArray(),
                'schedules_by_status' => Schedule::select('status', \DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->keyBy('status')
                    ->map(fn($item) => $item->count)
                    ->toArray(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error getting statistics: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener estadísticas'], 500);
        }
    }

    /**
     * Descargar reporte de horarios del equipo en PDF
     */
    public function downloadTeamSchedulesPdf(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $selectedUserId = $request->query('user_id');
            if ($selectedUserId !== null && !is_numeric((string) $selectedUserId)) {
                return response()->json(['error' => 'Parametro user_id invalido'], 422);
            }
            $selectedUserId = $selectedUserId !== null ? (int) $selectedUserId : null;

            // Obtener equipos liderados por el usuario (es jefe)
            $teams = Team::where('leader_id', $user->id)->with('members')->get();

            if ($teams->isEmpty()) {
                return response()->json(['error' => 'No hay equipos para este usuario'], 404);
            }

            if ($selectedUserId !== null) {
                $teams = $teams
                    ->filter(function ($team) use ($selectedUserId) {
                        return $team->members->contains('id', $selectedUserId);
                    })
                    ->values();

                if ($teams->isEmpty()) {
                    return response()->json(['error' => 'El usuario seleccionado no pertenece a tus equipos'], 404);
                }
            }

            // Cargar schedules para cada equipo
            foreach ($teams as $team) {
                if ($selectedUserId !== null) {
                    $team->setRelation(
                        'members',
                        $team->members->where('id', $selectedUserId)->values()
                    );
                }

                $memberIds = $team->members->pluck('id')->toArray();
                // Obtener todos los schedules de los miembros del equipo
                $team->schedules = Schedule::whereIn('user_id', $memberIds)
                    ->with('shifts', 'user')
                    ->orderBy('week_start', 'desc')
                    ->get();
                    
                Log::info('[ReportController] Team: ' . $team->name . ' - Members: ' . count($memberIds) . ' - Schedules: ' . count($team->schedules));
            }

            // Generar HTML y renderizar PDF en backend para evitar PDFs en blanco del cliente.
            $html = $this->generateScheduleHtml($teams, $user);
            $filename = $selectedUserId !== null
                ? 'horario_usuario_' . $selectedUserId . '_' . date('Y-m-d') . '.pdf'
                : 'horarios_' . date('Y-m-d') . '.pdf';
            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Error downloading team schedules PDF: ' . $e->getMessage());
            return response()->json(['error' => 'Error descargando reporte: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generar HTML para reporte de horarios
     */
    private function generateScheduleHtml($teams, $user)
    {
        $dayOrder = [
            'lunes' => 1,
            'martes' => 2,
            'miercoles' => 3,
            'miércoles' => 3,
            'jueves' => 4,
            'viernes' => 5,
            'sabado' => 6,
            'sábado' => 6,
            'domingo' => 7,
        ];

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte Semanal de Horarios</title>
    <style>
        @page { margin: 16mm; }
        body { font-family: DejaVu Sans, sans-serif; color: #111827; margin: 0; }
        h1 { font-size: 24px; margin-bottom: 6px; }
        h2 { font-size: 19px; margin: 24px 0 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
        h3 { font-size: 15px; margin: 16px 0 8px; }
        .meta { font-size: 13px; margin-bottom: 18px; color: #374151; }
        .summary { font-size: 13px; margin-bottom: 8px; color: #374151; }
        .card { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
        .center { text-align: center; }
        .empty { color: #6b7280; font-style: italic; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <h1>Reporte Semanal de Horarios</h1>
    <div class="meta">Generado: ' . date('d/m/Y H:i') . ' | Jefe: ' . e($user->name) . ' | Email: ' . e($user->email) . '</div>';

        foreach ($teams as $team) {
            $memberCount = count($team->members);
            $scheduleCount = isset($team->schedules) && is_iterable($team->schedules) ? count($team->schedules) : 0;
            $totalHours = $scheduleCount > 0 ? (float) ($team->schedules->sum('total_hours') ?? 0) : 0;

            $html .= '<h2>Equipo: ' . e($team->name) . '</h2>';
            $html .= '<div class="summary">Miembros: ' . $memberCount . ' | Horarios: ' . $scheduleCount . ' | Horas totales: ' . number_format($totalHours, 1) . '</div>';

            if ($scheduleCount === 0) {
                $html .= '<div class="empty">No hay horarios generados para este equipo.</div>';
                continue;
            }

            $sortedMembers = $team->members->sortBy(function ($member) {
                return mb_strtolower((string) ($member->name ?? ''));
            });

            foreach ($sortedMembers as $member) {
                $memberSchedules = $team->schedules
                    ->where('user_id', $member->id)
                    ->sortByDesc('week_start')
                    ->values();

                if ($memberSchedules->isEmpty()) {
                    continue;
                }

                foreach ($memberSchedules as $schedule) {
                    $status = ($schedule->status ?? null) === 'published' || (bool) ($schedule->published ?? false)
                        ? 'Publicado'
                        : 'Borrador';

                    $html .= '<div class="card">';
                    $html .= '<h3>' . e($member->name) . ' (' . e($member->email) . ')</h3>';
                    $html .= '<div class="summary">Semana: ' . e((string) $schedule->week_start) . ' | Horas semanales: ' . number_format((float) $schedule->total_hours, 1) . ' | Estado: ' . $status . '</div>';

                    $html .= '<table>';
                    $html .= '<thead><tr><th>Dia</th><th class="center">Inicio</th><th class="center">Fin</th><th class="center">Horas</th><th>Tipo</th></tr></thead>';
                    $html .= '<tbody>';

                    $sortedShifts = $schedule->shifts
                        ? $schedule->shifts->sortBy(function ($shift) use ($dayOrder) {
                            $day = strtolower((string) ($shift->day_of_week ?? ''));
                            return sprintf('%02d_%s', $dayOrder[$day] ?? 99, (string) ($shift->start_time ?? '99:99:99'));
                        })
                        : collect();

                    if ($sortedShifts->isEmpty()) {
                        $html .= '<tr><td colspan="5" class="empty">Sin turnos cargados para esta semana.</td></tr>';
                    } else {
                        foreach ($sortedShifts as $shift) {
                            $shiftType = ((bool) ($shift->is_opening ?? false))
                                ? 'Apertura'
                                : (((bool) ($shift->is_closing ?? false)) ? 'Cierre' : 'Regular');

                            $startTime = isset($shift->start_time) ? substr((string) $shift->start_time, 0, 5) : '-';
                            $endTime = isset($shift->end_time) ? substr((string) $shift->end_time, 0, 5) : '-';

                            $html .= '<tr>';
                            $html .= '<td>' . e(ucfirst((string) ($shift->day_of_week ?? '-'))) . '</td>';
                            $html .= '<td class="center">' . e($startTime) . '</td>';
                            $html .= '<td class="center">' . e($endTime) . '</td>';
                            $html .= '<td class="center">' . number_format((float) ($shift->hours ?? 0), 1) . '</td>';
                            $html .= '<td>' . $shiftType . '</td>';
                            $html .= '</tr>';
                        }
                    }

                    $html .= '</tbody></table>';
                    $html .= '</div>';
                }
            }
        }

        $html .= '</body></html>';

        return $html;
    }
}
