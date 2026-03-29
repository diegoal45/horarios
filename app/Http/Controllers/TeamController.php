<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TeamController extends Controller
{
    /**
     * Display a listing of teams
     */
    public function index(): JsonResponse
    {
        $teams = Team::with(['leader', 'members'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($teams);
    }

    /**
     * Display the specified team
     */
    public function show(Team $team): JsonResponse
    {
        $team->load(['leader', 'members', 'schedules']);

        return response()->json($team);
    }

    /**
     * Store a newly created team
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teams',
            'description' => 'nullable|string|max:1000',
            'leader_id' => 'required|exists:users,id',
            'max_members' => 'nullable|integer|between:1,6'
        ]);

        try {
            // Set default max_members if not provided
            if (empty($validated['max_members'])) {
                $validated['max_members'] = 6;
            }
            
            $team = Team::create($validated);
            $team->load(['leader']);

            return response()->json([
                'message' => 'Equipo creado exitosamente',
                'team' => $team
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified team
     */
    public function update(Request $request, Team $team): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255|unique:teams,name,' . $team->id,
            'description' => 'nullable|string|max:1000',
            'leader_id' => 'exists:users,id',
            'is_active' => 'boolean'
        ]);

        try {
            $team->update($validated);
            $team->load(['leader', 'members']);

            return response()->json([
                'message' => 'Equipo actualizado exitosamente',
                'team' => $team
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the specified team
     */
    public function destroy(Team $team): JsonResponse
    {
        try {
            $team->delete();

            return response()->json([
                'message' => 'Equipo eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a member to the team
     */
    public function addMember(Request $request, Team $team): JsonResponse
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        
        // Authorize: admins can manage any team, jefes can only manage their own teams
        $userRole = strtolower(trim($currentUser->role));
        $isAdmin = $userRole === 'administrador';
        $isLeader = $currentUser->id === $team->leader_id;
        
        if (!$isAdmin && !$isLeader) {
            return response()->json([
                'message' => "No tienes permisos para agregar miembros a este equipo. Eres: {$userRole}, Líder del equipo: {$team->leader_id}, Tu ID: {$currentUser->id}"
            ], 403);
        }
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            if ($team->isFull()) {
                return response()->json([
                    'message' => 'El equipo está lleno. Máximo 6 miembros.',
                    'available_slots' => 0
                ], 422);
            }

            if ($team->members()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'El usuario ya es miembro de este equipo'
                ], 422);
            }

            // Check if user is already in another team
            $userTeamCount = Team::whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count();

            if ($userTeamCount > 0) {
                return response()->json([
                    'message' => 'El usuario ya pertenece a otro equipo. Un usuario solo puede estar en un equipo.'
                ], 422);
            }

            $team->members()->attach($user->id);
            $team->load(['members']);

            return response()->json([
                'message' => 'Miembro agregado exitosamente',
                'team' => $team,
                'available_slots' => $team->getAvailableSlots()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al agregar miembro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a member from the team
     */
    public function removeMember(Request $request, Team $team): JsonResponse
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        
        // Authorize: admins can manage any team, jefes can only manage their own teams
        $isAdmin = strtolower($currentUser->role) === 'administrador';
        $isLeader = $currentUser->id === $team->leader_id;
        
        if (!$isAdmin && !$isLeader) {
            return response()->json([
                'message' => 'No tienes permisos para remover miembros de este equipo'
            ], 403);
        }
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            if (!$team->members()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'El usuario no es miembro de este equipo'
                ], 422);
            }

            $team->members()->detach($user->id);
            $team->load(['members']);

            return response()->json([
                'message' => 'Miembro removido exitosamente',
                'team' => $team,
                'available_slots' => $team->getAvailableSlots()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al remover miembro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all members of a team
     */
    public function getMembers(Team $team): JsonResponse
    {
        $members = $team->members()
            ->select('users.id', 'users.name', 'users.email', 'users.role')
            ->get();

        return response()->json([
            'team_id' => $team->id,
            'team_name' => $team->name,
            'total_members' => $members->count(),
            'available_slots' => $team->getAvailableSlots(),
            'max_members' => $team->max_members,
            'members' => $members
        ]);
    }

    /**
     * Get teams for the current user
     */
    public function getUserTeams(): JsonResponse
    {
        $user = auth()->user();
        $teams = $user->teams()
            ->with(['leader', 'members'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($teams);
    }

    /**
     * Get teams led by current user
     */
    public function getLedTeams(): JsonResponse
    {
        $user = auth()->user();
        $teams = Team::where('leader_id', $user->id)
            ->with(['leader', 'members', 'schedules'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($teams);
    }

    /**
     * Get all schedules for a team for a specific week
     */
    public function getTeamSchedules($team): JsonResponse
    {
        // Handle both Team object and ID
        $teamId = is_numeric($team) ? (int)$team : (is_object($team) ? $team->id : $team);
        
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $team = Team::with('members')->find($teamId);
        if (!$team) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        // Validar que el usuario sea el líder o admin
        if ($user->role === 'jefe' && $team->leader_id !== $user->id) {
            return response()->json(['message' => 'No eres el líder de este equipo'], 403);
        }

        $weekStart = request('week_start');
        if (!$weekStart) {
            $now = now();
            $weekStart = $now->copy()->startOfWeek()->toDateString();
        }

        $schedules = \App\Models\Schedule::where('team_id', $teamId)
            ->where('week_start', $weekStart)
            ->with(['user', 'shifts'])
            ->get();

        return response()->json($schedules);
    }
}
