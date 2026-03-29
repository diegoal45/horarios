<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeamsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing jefe users or create them
        $jefe1 = User::where('email', 'jefe@example.com')->first();
        $jefe2 = User::where('email', 'jefe2@example.com')->first();

        if (!$jefe1) {
            $jefe1 = User::create([
                'name' => 'Jefe Primero',
                'email' => 'jefe@example.com',
                'password' => bcrypt('password'),
                'role' => 'jefe',
                'email_verified_at' => now()
            ]);
        }

        if (!$jefe2) {
            $jefe2 = User::create([
                'name' => 'Jefe Segundo',
                'email' => 'jefe2@example.com',
                'password' => bcrypt('password'),
                'role' => 'jefe',
                'email_verified_at' => now()
            ]);
        }

        // Get workers that will be created by DatabaseSeeder
        // We'll just create the teams here, and workers will be assigned later
        
        $team1 = Team::create([
            'name' => 'Equipo Turno Mañana',
            'description' => 'Equipo de turno matutino (6:00 AM - 2:00 PM)',
            'leader_id' => $jefe1->id,
            'max_members' => 6,
            'is_active' => true
        ]);

        $team2 = Team::create([
            'name' => 'Equipo Turno Tarde',
            'description' => 'Equipo de turno vespertino (2:00 PM - 10:00 PM)',
            'leader_id' => $jefe2->id,
            'max_members' => 6,
            'is_active' => true
        ]);

        // Get workers to assign to teams
        $workers = User::where('role', 'trabajador')->get();

        // Assign workers to teams (max 6 each)
        $workersPerTeam = 3; // 3 per team for demo
        $workerIndex = 0;

        foreach ($workers->slice(0, $workersPerTeam) as $worker) {
            $team1->addMember($worker);
        }

        foreach ($workers->slice($workersPerTeam, $workersPerTeam) as $worker) {
            $team2->addMember($worker);
        }
    }
}
