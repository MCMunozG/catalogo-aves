<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Devuelve el id de petición entrante o crea uno para seguir un incidente entre servicios. */
class CorrelationId
{
    public function handle(Request $request, Closure $next)
    {
        $id = $request->header('X-Request-Id', (string) Str::ulid());
        $request->attributes->set('requestId', $id);
        return $next($request)->header('X-Request-Id', $id);
    }
}
