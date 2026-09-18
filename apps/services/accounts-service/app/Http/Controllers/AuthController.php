<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Transporte de autenticación. Los refresh tokens se hashean antes de persistirse y rotan al usarse;
 * el token en bruto sólo existe en esta frontera de petición/respuesta.
 */
class AuthController extends Controller
{
    /** Registra un usuario público; quien llama no puede elegir un rol privilegiado. */
    public function register(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['name' => 'required|string|max:120', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:12|confirmed']);
        $user = User::create([...$data, 'role' => 'user']);
        return response()->json($this->tokens($user, $jwt), 201);
    }
    /** Verifica credenciales y devuelve un nuevo par de access/refresh tokens. */
    public function login(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) return response()->json(['code' => 'INVALID_CREDENTIALS', 'message' => 'Invalid credentials'], 422);
        return response()->json($this->tokens($user, $jwt));
    }
    /** Rota un refresh token válido para que su valor en bruto no pueda reutilizarse. */
    public function refresh(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['refresh_token' => 'required|string']);
        $hash = hash('sha256', $data['refresh_token']);
        $row = DB::table('refresh_tokens')->where('token_hash', $hash)->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        if (!$row) return response()->json(['code' => 'INVALID_REFRESH_TOKEN', 'message' => 'Session expired'], 401);
        DB::table('refresh_tokens')->where('id', $row->id)->update(['revoked_at' => now()]);
        return response()->json($this->tokens(User::findOrFail($row->user_id), $jwt));
    }
    /** Revoca el refresh token enviado; los access tokens continúan expirando de forma natural. */
    public function logout(Request $r)
    {
        $data = $r->validate(['refresh_token' => 'required|string']);
        DB::table('refresh_tokens')->where('token_hash', hash('sha256', $data['refresh_token']))->update(['revoked_at' => now()]);
        return response()->noContent();
    }
    /** Persiste sólo el hash del refresh token y devuelve su contraparte en bruto de un solo uso. */
    private function tokens(User $user, JwtService $jwt): array
    {
        $refresh = Str::random(80);
        DB::table('refresh_tokens')->insert(['id' => (string)Str::ulid(), 'user_id' => $user->id, 'token_hash' => hash('sha256', $refresh), 'expires_at' => now()->addDays(30), 'created_at' => now(), 'updated_at' => now()]);
        return ['access_token' => $jwt->issue($user), 'refresh_token' => $refresh, 'token_type' => 'Bearer', 'expires_in' => config('catalogo_aves.access_ttl_minutes') * 60, 'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role]];
    }
}
