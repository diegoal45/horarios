<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ReportController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestPdfGeneration extends Command
{
    protected $signature = 'test:pdf-generation';
    protected $description = 'Test PDF generation for team schedules';

    public function handle()
    {
        $this->info('===== TESTING PDF GENERATION =====');
        
        // Get a jefe user with teams
        $jefe = User::where('role', 'jefe')
            ->join('teams', 'teams.leader_id', '=', 'users.id')
            ->select('users.*')
            ->first();
            
        if (!$jefe) {
            $this->error('No jefe user with teams found');
            return 1;
        }

        $this->info('✅ Found Jefe: ' . $jefe->name);
        
        // Authenticate as the jefe
        Auth::setUser($jefe);
        
        // Create an instance of the controller
        $controller = app(ReportController::class);
        
        // Create a mock request
        $request = request();
        
        // Call the method
        $response = $controller->downloadTeamSchedulesPdf($request);

        $status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : null;
        $contentType = $response->headers->get('content-type');
        $contentDisposition = $response->headers->get('content-disposition');
        $content = method_exists($response, 'getContent') ? (string) $response->getContent() : '';

        $this->info('HTTP Status: ' . ($status ?? 'N/A'));
        $this->info('Content-Type: ' . ($contentType ?? 'N/A'));
        $this->info('Content-Disposition: ' . ($contentDisposition ?? 'N/A'));
        $this->info('Content Length: ' . strlen($content) . ' bytes');

        if (is_string($contentType) && str_contains(strtolower($contentType), 'application/pdf')) {
            if (str_starts_with($content, '%PDF')) {
                $this->info('✅ PDF generated successfully (valid PDF signature)');
            } else {
                $this->warn('⚠️ Response is PDF but signature %PDF was not found at start');
            }
        } else {
            $this->error('❌ Endpoint did not return application/pdf');
            if (!empty($content)) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $this->warn('JSON response: ' . json_encode($decoded, JSON_PRETTY_PRINT));
                }
            }
        }
        
        $this->info('===== END TEST =====');
        
        return 0;
    }
}
?>
