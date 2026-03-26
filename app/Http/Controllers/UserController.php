<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\User\CreateRequest;
use App\Http\Requests\User\UpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;


class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();
        if (!$user || $user->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $users = User::all();
        return response()->json($users);
    }

    public function show($id): JsonResponse
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        return response()->json($user);
    }

    public function store(CreateRequest $request): JsonResponse
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user = User::create($request->validated());
        return response()->json($user, 201);
    }

    public function update(UpdateRequest $request, $id): JsonResponse
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        $user->update($request->validated());
        return response()->json($user);
    }

    public function destroy($id): JsonResponse
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user = User::find($id);
        if (!$user) {
            throw new ModelNotFoundException('Usuario no encontrado');
        }
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
