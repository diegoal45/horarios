<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Console\Command;

class TestScheduleGeneration extends Command
{
    protected $signature = 'test:generate-schedules';
    protected $description = 'Test schedule generation for teams';

    public function handle()
    {
        $this->info("\n===== TESTING SCHEDULE GENERATION =====\n");

        $teams = Team::with('members')->get();
        
        if ($teams->isEmpty()) {
            $this->error("❌ No teams found");
            return;
        }

        foreach ($teams as $team) {
            $this->info("Testing team: {$team->name}");
            $this->info("  Members: {$team->members->count()} / {$team->max_members}");

            if ($team->members->count() !== 6) {
                $this->error("  ❌ Team must have exactly 6 members");
                continue;
            }

            // Clear existing schedules for this week
            $now = now();
            $weekStart = $now->copy()->startOfWeek();
            
            $existingSchedules = Schedule::where('team_id', $team->id)
                ->where('week_start', $weekStart->toDateString())
                ->get();
            
            $this->info("  Cleaning up old schedules: {$existingSchedules->count()} deleted");
            
            foreach ($existingSchedules as $schedule) {
                $schedule->shifts()->delete();
                $schedule->delete();
            }

            // Call the generate logic
            $dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
            $horaApertura = '07:00:00';
            $horaCierre = '19:00:00';
            $duracionTurno = 7;
            $trabajadores = $team->members;
            $trabajadorIds = $trabajadores->pluck('id');

            $horasSemanales = array_fill_keys($trabajadorIds->all(), 0);
            $schedulesMap = [];

            foreach ($trabajadores as $trabajador) {
                $schedulesMap[$trabajador->id] = Schedule::create([
                    'user_id' => $trabajador->id,
                    'team_id' => $team->id,
                    'week_start' => $weekStart->toDateString(),
                    'total_hours' => 0,
                ]);
            }

            foreach ($dias as $dia) {
                $ids = $trabajadorIds->shuffle()->values();
                $aperturaId = $ids[0];
                $cierreIds = [$ids[1], $ids[2]];

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

            foreach ($schedulesMap as $tid => $schedule) {
                $schedule->total_hours = $horasSemanales[$tid];
                $schedule->save();
            }

            $this->info("  ✅ Generated schedules for week starting: {$weekStart->toDateString()}");
            
            // Verify
            $generatedSchedules = Schedule::where('team_id', $team->id)
                ->where('week_start', $weekStart->toDateString())
                ->with('shifts')
                ->get();
            
            $this->info("  Generated schedules: {$generatedSchedules->count()}");
            $totalShifts = $generatedSchedules->sum(function($s) { return $s->shifts->count(); });
            $this->info("  Total shifts created: {$totalShifts}");
        }

        $this->info("\n===== TEST COMPLETE =====\n");
    }
}
