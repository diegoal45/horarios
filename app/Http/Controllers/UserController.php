<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\User\CreateRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Helpers\AuthHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;


class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        
        $userRole = strtolower(trim($user->role));
        
        // Admin: ver todos los usuarios
        if ($userRole === 'administrador') {
            $users = User::all();
        }
        // Jefes: ver todos los usuarios (para poder agregarlos a equipos)
        elseif ($userRole === 'jefe') {
            $users = User::all();
        }
        // Otros roles: solo verse a sí mismos
        else {
            $users = User::where('id', $user->id)->get();
        }
        
        return response()->json($users);
    }

    public function show($id): JsonResponse
    {
        // El middleware ya validó que es administrador
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        return response()->json($user);
    }

    public function store(CreateRequest $request): JsonResponse
    {
        // El middleware ya validó que es administrador
        $user = User::create($request->validated());
        return response()->json($user, 201);
    }

    public function update(UpdateRequest $request, $id): JsonResponse
    {
        // El middleware ya validó que es administrador
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        
        // Obtener datos validados y filtrar password null
        $data = $request->validated();
        if (isset($data['password']) && is_null($data['password'])) {
            unset($data['password']);
        }
        
        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id): JsonResponse
    {
        // El middleware ya validó que es administrador
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
