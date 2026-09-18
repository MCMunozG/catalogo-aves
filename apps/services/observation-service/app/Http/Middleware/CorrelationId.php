<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Transporta un id de petición entre fronteras HTTP para logs y la dependencia Catalog. */
class CorrelationId
{
    public function handle(Request $request, Closure $next)
    {
        $id = $request->header('X-Request-Id', (string) Str::ulid());
        $request->attributes->set('requestId', $id);
        return $next($request)->header('X-Request-Id', $id);
    }
}
