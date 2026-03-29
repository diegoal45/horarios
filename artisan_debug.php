DB::enableQueryLog();

// Check if schedules exist
$schedules = Schedule::with('user', 'shifts')->get();
echo "Total schedules: " . $schedules->count() . "\n";

if ($schedules->count() > 0) {
    $schedule = $schedules->first();
    echo "Sample Schedule:\n";
    echo "  ID: " . $schedule->id . "\n";
    echo "  Team ID: " . $schedule->team_id . "\n";
    echo "  Week Start: " . $schedule->week_start . "\n";
    echo "  User: " . ($schedule->user ? $schedule->user->name : 'NULL') . "\n";
    echo "  Shifts: " . $schedule->shifts->count() . "\n";
    echo "\n";
}

// Check teams with members
$teams = Team::with('members')->where('id', 1)->first();
if ($teams) {
    echo "Team 1:\n";
    echo "  Name: " . $teams->name . "\n";
    echo "  Members: " . $teams->members->count() . "\n";
    echo "  Leader ID: " . $teams->leader_id . "\n";
}

echo "\nSQL Queries:\n";
foreach (DB::getQueryLog() as $query) {
    echo $query['query'] . "\n";
}
