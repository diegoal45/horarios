<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;

class SchedulesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users to assign schedules to
        $users = User::limit(3)->get();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Create users first.');
            return;
        }

        // Create schedules for each user
        foreach ($users as $user) {
            // Schedule for this week
            $weekStart = Carbon::now()->startOfWeek(); // Monday
            
            $schedule = Schedule::create([
                'user_id' => $user->id,
                'team_id' => $user->teams()->first()?->id,
                'week_start' => $weekStart->format('Y-m-d'),
                'total_hours' => 40,
            ]);

            // Create shifts for Monday to Friday
            $shifts = [
                [
                    'day_of_week' => 0, // Monday
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00',
                    'is_opening' => true,
                    'is_closing' => false,
                    'hours' => 8,
                ],
                [
                    'day_of_week' => 1, // Tuesday
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00',
                    'is_opening' => true,
                    'is_closing' => false,
                    'hours' => 8,
                ],
                [
                    'day_of_week' => 2, // Wednesday
                    'start_time' => '14:00:00',
                    'end_time' => '22:00:00',
                    'is_opening' => false,
                    'is_closing' => true,
                    'hours' => 8,
                ],
                [
                    'day_of_week' => 3, // Thursday
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00',
                    'is_opening' => true,
                    'is_closing' => false,
                    'hours' => 8,
                ],
                [
                    'day_of_week' => 4, // Friday
                    'start_time' => '08:00:00',
                    'end_time' => '16:00:00',
                    'is_opening' => true,
                    'is_closing' => false,
                    'hours' => 8,
                ],
            ];

            foreach ($shifts as $shiftData) {
                Shift::create([
                    'schedule_id' => $schedule->id,
                    ...$shiftData,
                ]);
            }

            $this->command->info("Created schedule for user: {$user->name}");
        }
    }
}
