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
        // Definir los orígenes permitidos
        $allowedOrigins = [
            'http://localhost:4200',
            'http://127.0.0.1:4200',
            'localhost:4200'
        ];

        $origin = $request->header('Origin');

        // Manejar preflight requests (OPTIONS) antes del pipeline normal.
        if ($request->isMethod('OPTIONS')) {
            $preflight = response()->json([], 200);
            if (in_array($origin, $allowedOrigins, true)) {
                $preflight->headers->set('Access-Control-Allow-Origin', $origin);
                $preflight->headers->set('Access-Control-Allow-Credentials', 'true');
                $preflight->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                $preflight->headers->set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
                $preflight->headers->set('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition, X-JSON-Response-Code');
                $preflight->headers->set('Access-Control-Max-Age', '86400');
            }
            return $preflight;
        }

        $response = $next($request);

        if (in_array($origin, $allowedOrigins, true)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition, X-JSON-Response-Code');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }

        return $response;
    }
}
