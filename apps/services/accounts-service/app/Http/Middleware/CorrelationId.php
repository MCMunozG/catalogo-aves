<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Returns the incoming request id or creates one so an incident can be followed across services. */
class CorrelationId
{
    public function handle(Request $request, Closure $next)
    {
        $id = $request->header('X-Request-Id', (string) Str::ulid());
        $request->attributes->set('requestId', $id);
        return $next($request)->header('X-Request-Id', $id);
    }
}
