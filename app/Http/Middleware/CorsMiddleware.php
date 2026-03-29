<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Definir los orígenes permitidos
        $allowedOrigins = [
            'http://localhost:4200',
            'http://127.0.0.1:4200',
            'localhost:4200'
        ];

        $origin = $request->header('Origin');

        if (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Credentials', 'true');
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
            $response->header('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response-Code');
            $response->header('Access-Control-Max-Age', '86400');
        }

        // Manejar preflight requests (OPTIONS)
        if ($request->isMethod('OPTIONS')) {
            return response()->json([], 200);
        }

        return $response;
    }
}
