<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class GenerateToken extends Command
{
    protected $signature = 'test:generate-token';
    protected $description = 'Generate an auth token for a jefe user';

    public function handle()
    {
        $jefe = User::where('role', 'jefe')
            ->join('teams', 'teams.leader_id', '=', 'users.id')
            ->select('users.*')
            ->first();

        if (!$jefe) {
            $this->error('No jefe user with teams found');
            return 1;
        }

        $token = $jefe->createToken('test-token');

        $this->info('Token generated for: ' . $jefe->name . ' (' . $jefe->email . ')');
        $this->info('');
        $this->line('<info>Authorization: Bearer ' . $token->plainTextToken . '</info>');
        $this->info('');
        $this->info('API Endpoint: http://localhost:8000/api/reports/team-schedules-pdf');
        
        return 0;
    }
}
?>
