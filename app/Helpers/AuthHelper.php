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
        if (!in_array($user->role, $roles)) {
            return [false, response()->json(['message' => 'No autorizado'], 403)];
        }
        return [true, null];
    }
}
