<?php
// Test script to verify database setup

require 'bootstrap/app.php';

use App\Models\User;
use App\Models\Team;

echo "\n===== USUARIOS =====\n";
$users = User::all();
echo "Total de usuarios: " . $users->count() . "\n";

echo "\nPor rol:\n";
echo "  - Administrador: " . User::where('role', 'administrador')->count() . "\n";
echo "  - Jefe: " . User::where('role', 'jefe')->count() . "\n";
echo "  - Trabajador: " . User::where('role', 'trabajador')->count() . "\n";

echo "\n===== EQUIPOS =====\n";
$teams = Team::with('members')->get();
echo "Total de equipos: " . $teams->count() . "\n";

foreach ($teams as $team) {
    echo "\n▸ " . $team->name . "\n";
    echo "  - Líder: " . ($team->leader?->name ?? 'N/A') . "\n";
    echo "  - Miembros: " . $team->members->count() . " / " . $team->max_members . "\n";
    if ($team->members->count() === 6) {
        echo "  - Status: ✅ Listo para generar horarios\n";
    } else {
        echo "  - Status: ❌ Necesita 6 miembros\n";
    }
}

echo "\n";
