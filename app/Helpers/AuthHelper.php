<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    /**
     * Verifica si el usuario está autenticado y tiene alguno de los roles permitidos.
     * Devuelve un array: [bool $ok, \Illuminate\Http\JsonResponse|null $response]
     */
    public static function checkRole(array $roles)
    {
        $user = Auth::user();
        if (!$user) {
            return [false, response()->json(['message' => 'No autenticado'], 401)];
        }
        
        $userRole = strtolower($user->role);
        $normalizedRoles = array_map('strtolower', $roles);
        
        if (!in_array($userRole, $normalizedRoles)) {
            return [false, response()->json(['message' => 'No autorizado. Roles requeridos: ' . implode(', ', $roles)], 403)];
        }
        return [true, null];
    }

    /**
     * Verifica si el usuario es administrador (case-insensitive)
     */
    public static function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }
        return strtolower($user->role ?? '') === 'administrador';
    }

    /**
     * Verifica si el usuario tiene un rol específico (case-insensitive)
     */
    public static function hasRole($user, string $role): bool
    {
        if (!$user) {
            return false;
        }
        return strtolower($user->role ?? '') === strtolower($role);
    }

    /**
     * Verifica si el usuario puede gestionar otros usuarios
     */
    public static function canManageUsers($user): bool
    {
        if (!$user) {
            return false;
        }
        $role = strtolower($user->role ?? '');
        return $role === 'administrador' || $role === 'jefe';
    }
}
