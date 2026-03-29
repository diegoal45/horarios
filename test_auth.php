<?php
// Cargar Laravel
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Simular una request actual
$request = \Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

// Test de autenticación
$user = \App\Models\User::first();
if ($user) {
    $token = $user->createToken('test-token')->plainTextToken;
    echo "Token generado para {$user->email}: " . substr($token, 0, 20) . "...\n";
    echo "Token completo: $token\n";
} else {
    echo "No hay usuarios en la BD\n";
}
