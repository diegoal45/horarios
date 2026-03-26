<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                // Validación
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'message' => 'Datos inválidos',
                        'errors' => $e->errors(),
                    ], 422);
                }
                // No autenticado
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'message' => 'No autenticado',
                    ], 401);
                }
                // Modelo no encontrado
                if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    return response()->json([
                        'message' => 'Recurso no encontrado',
                    ], 404);
                }
                // Excepciones HTTP
                if ($e instanceof HttpExceptionInterface) {
                    return response()->json([
                        'message' => $e->getMessage() ?: 'Error HTTP',
                    ], $e->getStatusCode());
                }
                // Otros errores
                return response()->json([
                    'message' => $e->getMessage() ?: 'Error interno del servidor',
                ], 500);
            }
        });
    }
}
