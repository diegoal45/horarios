<?php
require 'bootstrap/app.php';

use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\Route;

echo "===== TESTING PDF ENDPOINT =====\n\n";

// Get a jefe user
$jefe = User::where('role', 'jefe')->first();
if (!$jefe) {
    echo "❌ No jefe user found\n";
    exit;
}

echo "✅ Found Jefe: " . $jefe->name . "\n";

// Get teams led by this jefe
$teams = Team::where('leader_id', $jefe->id)->with('members')->get();
echo "✅ Teams led by " . $jefe->name . ": " . count($teams) . "\n\n";

foreach ($teams as $team) {
    echo "Team: " . $team->name . "\n";
    echo "  Members: " . count($team->members) . "\n";
    
    // Load schedules for each team member
    $memberIds = $team->members->pluck('id')->toArray();
    echo "  Member IDs: " . implode(", ", $memberIds) . "\n";
    
    // Query schedules
    $schedules = \App\Models\Schedule::whereIn('user_id', $memberIds)
        ->with('shifts', 'user')
        ->orderBy('week_start', 'desc')
        ->get();
    
    echo "  Schedules found: " . count($schedules) . "\n";
    
    if (count($schedules) > 0) {
        echo "  Sample schedule:\n";
        $schedule = $schedules->first();
        echo "    - User: " . $schedule->user->name . "\n";
        echo "    - Week Start: " . $schedule->week_start . "\n";
        echo "    - Total Hours: " . $schedule->total_hours . "\n";
        echo "    - Shifts: " . count($schedule->shifts) . "\n";
    }
    
    echo "\n";
}

echo "===== ENDPOINT TEST COMPLETE =====\n";
?>
