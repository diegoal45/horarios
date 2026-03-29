<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Schedule;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
}
