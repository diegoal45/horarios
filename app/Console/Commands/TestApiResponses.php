<?php

namespace App\Console\Commands;

use App\Models\Team;
use Illuminate\Console\Command;

class TestApiResponses extends Command
{
    protected $signature = 'test:api-responses';
    protected $description = 'Test API responses for Led Teams endpoint';

    public function handle()
    {
        $this->info("\n===== TESTING API RESPONSES =====\n");

        $this->info("Testing getLedTeams for Jefe User...\n");

        // Get the first jefe user
        $jefe = \App\Models\User::where('email', 'jefe@example.com')->first();
        
        if (!$jefe) {
            $this->error("❌ Jefe user not found");
            return;
        }

        $this->info("Jefe: {$jefe->name} (ID: {$jefe->id})");

        // Get led teams
        $teams = Team::where('leader_id', $jefe->id)
            ->with(['leader', 'members', 'schedules'])
            ->orderBy('created_at', 'desc')
            ->get();

        $this->info("Led Teams: {$teams->count()}\n");

        foreach ($teams as $team) {
            $this->info("Team: {$team->name}");
            $this->info("  - Leader: {$team->leader->name}");
            $this->info("  - Members: {$team->members->count()}");
            $this->info("  - Member Names:");
            foreach ($team->members as $member) {
                $this->info("    • {$member->name} ({$member->email})");
            }
            $this->info("  - Schedules: {$team->schedules->count()}");
            if ($team->schedules->count() > 0) {
                $this->info("    Sample schedule:");
                $schedule = $team->schedules->first();
                $this->info("      Week Start: {$schedule->week_start}");
                $this->info("      Total Hours: {$schedule->total_hours}");
                $this->info("      Shifts: {$schedule->shifts->count()}");
            }
            $this->info("");
        }

        // Test the JSON response
        $jsonResponse = $teams->toJson();
        $this->info("JSON Response (first 500 chars):");
        $this->info(substr($jsonResponse, 0, 500) . "...\n");

        $this->info("===== TEST COMPLETE =====\n");
    }
}
