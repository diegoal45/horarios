<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Debug route - check if schedules exist (REMOVE THIS IN PRODUCTION)
Route::get('/api/test/schedules', function () {
    $schedules = \App\Models\Schedule::with('user', 'shifts')->limit(5)->get();
    return response()->json([
        'total_schedules' => \App\Models\Schedule::count(),
        'total_shifts' => \App\Models\Shift::count(),
        'sample_schedules' => $schedules,
    ]);
});

// Debug route - test team schedules endpoint
Route::get('/api/test/team/{teamId}/schedules', function ($teamId) {
    $weekStart = request('week_start') ?? now()->startOfWeek()->toDateString();
    
    $team = \App\Models\Team::with('members')->find($teamId);
    if (!$team) {
        return response()->json(['error' => 'Team not found'], 404);
    }
    
    $schedules = \App\Models\Schedule::where('team_id', $teamId)
        ->where('week_start', $weekStart)
        ->with(['user', 'shifts'])
        ->get();
    
    return response()->json([
        'team_id' => $teamId,
        'week_start' => $weekStart,
        'found_schedules' => count($schedules),
        'schedules' => $schedules,
    ]);
});
