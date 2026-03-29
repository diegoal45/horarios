<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Parse multiple roles separated by comma (e.g., "jefe,administrador")
        $allowedRoles = array_map('trim', explode(',', $role));
        $userRole = strtolower($user->role);

        // Check if user role is in the allowed roles
        $isAllowed = in_array($userRole, array_map('strtolower', $allowedRoles));

        if (!$isAllowed) {
            return response()->json(['message' => 'No autorizado. Se requiere rol: ' . $role], 403);
        }

        return $next($request);
    }
}
