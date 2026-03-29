<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DebugScheduleStructure extends Command
{
    protected $signature = 'debug:schedule-structure';
    protected $description = 'Debug the exact structure of schedule data';

    public function handle()
    {
        $this->info("\n===== DEBUGGING SCHEDULE STRUCTURE =====\n");

        $team = Team::first();
        if (!$team) {
            $this->error("❌ No teams found");
            return;
        }

        // Get schedules for the team
        $weekStart = now()->copy()->startOfWeek();
        $schedules = Schedule::where('team_id', $team->id)
            ->where('week_start', $weekStart->toDateString())
            ->with(['user', 'shifts'])
            ->limit(1)
            ->get();

        if ($schedules->isEmpty()) {
            $this->warn("No schedules found for week starting {$weekStart->toDateString()}");
            
            // Check if any schedules exist at all
            $allSchedules = Schedule::where('team_id', $team->id)->get();
            $this->info("Total schedules for team: " . $allSchedules->count());
            
            if ($allSchedules->count() > 0) {
                $this->info("Available weeks:");
                foreach ($allSchedules->groupBy('week_start') as $week => $items) {
                    $this->info("  - {$week}: " . $items->count() . " schedules");
                }
            }
            return;
        }

        $schedule = $schedules->first();
        
        $this->info("Schedule ID: {$schedule->id}");
        $this->info("Team ID: {$schedule->team_id}");
        $this->info("Week Start: {$schedule->week_start}");
        $this->info("Total Hours: {$schedule->total_hours}");
        $this->info("User ID: {$schedule->user_id}");
        $this->info("User Name: {$schedule->user->name}");
        $this->info("Shifts Count: " . $schedule->shifts->count());
        
        if ($schedule->shifts->count() > 0) {
            $shift = $schedule->shifts->first();
            
            $this->info("\nFirst Shift Structure:");
            $this->info("  - ID: {$shift->id}");
            $this->info("  - Day of Week: {$shift->day_of_week}");
            $this->info("  - Start Time: {$shift->start_time}");
            $this->info("  - End Time: {$shift->end_time}");
            $this->info("  - Hours: {$shift->hours}");
            $this->info("  - Is Opening: " . ($shift->is_opening ? 'true' : 'false'));
            $this->info("  - Is Closing: " . ($shift->is_closing ? 'true' : 'false'));
            
            $this->info("\nExtract Tests:");
            $this->info("  - substring start_time 5: '" . substr($shift->start_time, 0, 5) . "'");
            $this->info("  - substring end_time 5: '" . substr($shift->end_time, 0, 5) . "'");
        }

        // Show JSON structure
        $this->info("\n\nJSON Response Structure:");
        $json = $schedules->toJson(JSON_PRETTY_PRINT);
        $this->info(substr($json, 0, 1000));
        if (strlen($json) > 1000) {
            $this->info("... (truncated)");
        }

        $this->info("\n===== END DEBUG =====\n");
    }
}
