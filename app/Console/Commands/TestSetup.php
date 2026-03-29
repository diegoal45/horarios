<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestSetup extends Command
{
    protected $signature = 'test:setup';
    protected $description = 'Display test setup instructions';

    public function handle()
    {
        $this->info('===== PRUEBA DE DESCARGA PDF =====');
        $this->info('');
        
        // Get a jefe user with teams
        $jefe = User::where('role', 'jefe')
            ->join('teams', 'teams.leader_id', '=', 'users.id')
            ->select('users.*')
            ->first();

        if (!$jefe) {
            $this->error('No jefe user with teams found');
            return 1;
        }

        // Generate token
        $token = $jefe->createToken('test-token')->plainTextToken;

        $this->info('');
        $this->line('<info>1. CREDENCIALES DE PRUEBA:</info>');
        $this->line('   Email: ' . $jefe->email);
        $this->line('   Contraseña: password');
        $this->line('');
        
        $this->line('<info>2. ENDPOINTS DISPONIBLES:</info>');
        $this->line('   Backend: http://localhost:8000');
        $this->line('   Frontend: http://localhost:4201');
        $this->line('');
        
        $this->line('<info>3. PRUEBA MANUAL DEL ENDPOINT:</info>');
        $this->line('   curl -X GET http://localhost:8000/api/reports/team-schedules-pdf \\');
        $this->line('     -H "Authorization: Bearer ' . substr($token, 0, 20) . '..."');
        $this->line('');
        
        $this->line('<info>4. PASOS PARA PROBAR DESCARGA PDF:</info>');
        $this->line('   a) Abre: http://localhost:4201');
        $this->line('   b) Inicia sesión con:');
        $this->line('      Email: ' . $jefe->email);
        $this->line('      Contraseña: password');
        $this->line('   c) Ve al Dashboard Jefe');
        $this->line('   d) Busca el botón "Descargar Reporte" (esquina inferior derecha)');
        $this->line('   e) Haz click');
        $this->line('   f) Abre la consola (F12) para ver logs');
        $this->line('');
        
        $this->line('<info>5. QUÉ ESPERAR:</info>');
        $this->line('   - Verás logs en la consola: [JefeDashboard]');
        $this->line('   - Notificación: "Generando reporte..."');
        $this->line('   - Luego: "Reporte descargado exitosamente"');
        $this->line('   - El PDF se descargará automáticamente');
        $this->line('');
        
        $this->line('<info>6. SI NO FUNCIONA:</info>');
        $this->line('   a) Abre la consola (F12)');
        $this->line('   b) Revisa los logs de [JefeDashboard]');
        $this->line('   c) Busca mensajes de error');
        $this->line('   d) Verifica que el status de la petición sea 200');
        $this->line('');

        return 0;
    }
}
?>
