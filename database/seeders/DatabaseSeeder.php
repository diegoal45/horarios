<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Schedule;
use App\Models\Shift;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesTableSeeder::class,
        ]);

        // Create demo users with their roles
        $users = [];

        $users[] = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'administrador',
        ]);

        $users[] = User::create([
            'name' => 'Jefe User',
            'email' => 'jefe@example.com',
            'password' => bcrypt('password'),
            'role' => 'jefe',
        ]);

        $users[] = User::create([
            'name' => 'Jefe Segundo',
            'email' => 'jefe2@example.com',
            'password' => bcrypt('password'),
            'role' => 'jefe',
        ]);

        $users[] = User::create([
            'name' => 'Carlos Ruiz',
            'email' => 'carlos@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Elena Vargas',
            'email' => 'elena@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Miguel Torres',
            'email' => 'miguel@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Sofía Méndez',
            'email' => 'sofia@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Roberto Díaz',
            'email' => 'roberto@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Lucía Ferrán',
            'email' => 'lucia@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        // Create schedules and shifts for demo
        foreach ($users as $user) {
            for ($i = 0; $i < 3; $i++) {
                $date = Carbon::now()->addDays($i);
                $schedule = Schedule::create([
                    'user_id' => $user->id,
                    'week_start' => $date->toDateString(),
                    'total_hours' => 8,
                ]);

                // Create shifts for this schedule
                Shift::create([
                    'schedule_id' => $schedule->id,
                    'start_time' => $date->copy()->setHour(8)->setMinutes(0),
                    'end_time' => $date->copy()->setHour(12)->setMinutes(0),
                ]);

                Shift::create([
                    'schedule_id' => $schedule->id,
                    'start_time' => $date->copy()->setHour(13)->setMinutes(0),
                    'end_time' => $date->copy()->setHour(17)->setMinutes(0),
                ]);
            }
        }

        // Call TeamsTableSeeder after all users are created
        $this->call([
            TeamsTableSeeder::class,
        ]);
    }
}
