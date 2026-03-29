<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Team;

class DebugDatabase extends Command
{
    protected $signature = 'debug:database';
    protected $description = 'Debug database setup for schedules';

    public function handle()
    {
        $this->info("\n===== USUARIOS =====");
        $users = User::all();
        $this->info("Total de usuarios: " . $users->count());

        $this->info("\nPor rol:");
        $this->info("  - Administrador: " . User::where('role', 'administrador')->count());
        $this->info("  - Jefe: " . User::where('role', 'jefe')->count());
        $this->info("  - Trabajador: " . User::where('role', 'trabajador')->count());

        $this->info("\n===== EQUIPOS =====");
        $teams = Team::with('members')->get();
        $this->info("Total de equipos: " . $teams->count());

        foreach ($teams as $team) {
            $this->info("\n▸ " . $team->name);
            $this->info("  - Líder: " . ($team->leader?->name ?? 'N/A'));
            $this->info("  - Miembros: " . $team->members->count() . " / " . $team->max_members);
            if ($team->members->count() === 6) {
                $this->info("  - Status: ✅ Listo para generar horarios");
            } else {
                $this->error("  - Status: ❌ Necesita 6 miembros");
            }
        }

        $this->info("");
    }
}
