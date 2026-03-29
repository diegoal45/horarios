<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DebugController extends Controller
{
    public function checkData(): JsonResponse
    {
        return response()->json([
            'date_info' => [
                'today' => now()->toDateString(),
                'today_day' => now()->format('l'),
                'start_of_week' => now()->startOfWeek()->toDateString(),
                'start_of_week_day' => now()->startOfWeek()->format('l'),
            ],
            'statistics' => [
                'total_schedules' => \App\Models\Schedule::count(),
                'total_shifts' => \App\Models\Shift::count(),
                'teams' => \App\Models\Team::count(),
                'teams_with_6_members' => \App\Models\Team::withCount('members')->having('members_count', '=', 6)->count(),
            ],
            'sample_schedules' => \App\Models\Schedule::with('user', 'shifts')->limit(3)->get()->map(fn($s) => [
                'id' => $s->id,
                'team_id' => $s->team_id,
                'user_id' => $s->user_id,
                'user_name' => $s->user?->name,
                'week_start' => $s->week_start,
                'shifts_count' => $s->shifts->count(),
            ]),
            'teams_detail' => \App\Models\Team::with('members')->get()->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'leader_id' => $t->leader_id,
                'leader_name' => $t->leader?->name ?? 'No asignado',
                'members_count' => $t->members->count(),
                'members' => $t->members->map(fn($m) => ['id' => $m->id, 'name' => $m->name])->toArray(),
                'max_members' => $t->max_members,
            ]),
        ]);
    }

    public function fixTeamMembers(): JsonResponse
    {
        // Get Team 1 and add 6 members
        $team = \App\Models\Team::find(1);
        if (!$team) {
            return response()->json(['error' => 'Team 1 not found'], 404);
        }

        // Get 6 trabajador users (role = trabajador)
        $workers = \App\Models\User::where('role', 'trabajador')->limit(6)->get();
        if ($workers->count() < 6) {
            return response()->json(['error' => 'Not enough trabajador users. Found: ' . $workers->count()], 400);
        }

        // Attach members
        $team->members()->attach($workers->pluck('id'));

        return response()->json([
            'message' => 'Team members added successfully',
            'team_id' => $team->id,
            'members_count' => $team->members()->count(),
            'members' => $team->members()->get()->map(fn($m) => ['id' => $m->id, 'name' => $m->name]),
        ]);
    }
}
