<?php

namespace App\Http\Controllers;

use App\Models\Species;
use Illuminate\Http\Request;

/** Catalog es dueño de los datos editoriales, incluida la política de sensibilidad que consume Observation. */
class SpeciesController extends Controller
{
    /** Lista sólo especies publicadas y opcionalmente filtra los dos nombres legibles. */
    public function index(Request $r)
    {
        $q = Species::query()->where('is_published', true);
        if ($s = $r->string('q')->toString()) $q->where(fn($x) => $x->where('common_name', 'like', "%$s%")->orWhere('scientific_name', 'like', "%$s%"));
        return $q->orderBy('common_name')->paginate(20);
    }
    /** Oculta borradores editoriales no publicados del contrato público de Catalog. */
    public function show(Species $species)
    {
        abort_unless($species->is_published, 404);
        return $species;
    }
    /** Crea una especie después de revisar la instantánea de roles emitida por Accounts. */
    public function store(Request $r)
    {
        $this->allowed($r);
        return response()->json(Species::create($this->data($r)), 201);
    }
    /** Actualiza una especie sin permitir campos no confiables fuera del contrato de validación. */
    public function update(Request $r, Species $species)
    {
        $this->allowed($r);
        $species->update($this->data($r));
        return $species;
    }
    /** Permite modificar datos de Catalog sólo a roles editoriales. */
    private function allowed(Request $r): void
    {
        $roles = $r->attributes->get('identity')['roles'] ?? [];
        abort_unless(array_intersect($roles, ['curator', 'admin', 'superadmin']), 403);
    }
    /** Centraliza el contrato HTTP de campos compartido por creación y actualización. */
    private function data(Request $r): array
    {
        return $r->validate(['common_name' => 'required|string|max:140', 'scientific_name' => 'required|string|max:180', 'taxonomy' => 'nullable|array', 'description' => 'nullable|string', 'size' => 'nullable|string|max:100', 'habitat' => 'nullable|string', 'feeding' => 'nullable|string', 'distribution' => 'nullable|string', 'typical_hours' => 'nullable|array', 'seasons' => 'nullable|array', 'similar_species' => 'nullable|array', 'distinguishing_features' => 'nullable|string', 'conservation_status' => 'nullable|string|max:100', 'sensitivity' => 'required|in:EXACT,APPROXIMATE,HIDDEN', 'is_published' => 'boolean']);
    }
}
