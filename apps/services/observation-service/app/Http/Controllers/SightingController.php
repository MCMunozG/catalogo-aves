<?php

namespace App\Http\Controllers;

use App\Domain\Sightings\CreateSighting;
use App\Http\Requests\StoreSightingRequest;
use App\Http\Resources\SightingResource;
use App\Models\Sighting;
use Illuminate\Http\Request;

/** HTTP adapter for sighting projections; publication rules live in CreateSighting. */
class SightingController extends Controller
{
    /** Delegates publication policy to the use case and translates unavailable Catalog into HTTP 503. */
    public function store(StoreSightingRequest $request, CreateSighting $createSighting)
    {
        $result = $createSighting->handle(
            $request->validated(),
            $request->attributes->get('identity')['id'],
            $request->attributes->get('requestId'),
        );

        if ($result['catalogUnavailable']) {
            return response()->json([
                'code' => 'CATALOG_UNAVAILABLE',
                'message' => 'Cannot publish while species sensitivity is unavailable; save as draft.',
            ], 503);
        }

        return (new SightingResource($result['created'], true))->response()->setStatusCode(201);
    }

    /** Returns the owner projection, including private location, for the JWT subject only. */
    public function mine(Request $request)
    {
        $sightings = Sighting::query()
            ->where('user_id', $request->attributes->get('identity')['id'])
            ->latest('observed_at')
            ->paginate(20);

        return $sightings->through(
            fn(Sighting $sighting) => (new SightingResource($sighting, true))->resolve(),
        );
    }

    /** Lets the owner or authorized reviewers inspect a sighting; existence is hidden otherwise. */
    public function show(Request $request, Sighting $s)
    {
        $identity = $request->attributes->get('identity');
        $canReview = array_intersect($identity['roles'], ['moderator', 'admin', 'superadmin']);

        abort_unless($s->user_id === $identity['id'] || $canReview, 404);

        return new SightingResource($s, true);
    }

    /** Actualiza sólo un registro propio y vuelve a calcular su proyección pública con las reglas vigentes. */
    public function update(StoreSightingRequest $request, Sighting $s, CreateSighting $createSighting)
    {
        abort_unless($s->user_id === $request->attributes->get('identity')['id'], 404);

        $result = $createSighting->prepare($request->validated(), $request->attributes->get('requestId'));
        if ($result['catalogUnavailable']) {
            return response()->json([
                'code' => 'CATALOG_UNAVAILABLE',
                'message' => 'Cannot publish while species sensitivity is unavailable; save as draft.',
            ], 503);
        }

        $s->fill($result['attributes'])->save();

        return new SightingResource($s->fresh(), true);
    }

    /** El dueño puede retirar definitivamente un borrador o registro sin afectar datos de otras personas. */
    public function destroy(Request $request, Sighting $s)
    {
        abort_unless($s->user_id === $request->attributes->get('identity')['id'], 404);
        $s->delete();

        return response()->noContent();
    }

    /** The public map is deliberately limited to the resource's public projection. */
    public function map(Request $request)
    {
        $query = Sighting::query()
            ->whereIn('status', ['PUBLISHED', 'VERIFIED', 'NEEDS_IDENTIFICATION'])
            ->whereNotNull('public_lat');

        if ($request->filled('species_id')) {
            $query->where('species_id', $request->string('species_id'));
        }

        return SightingResource::collection($query->latest('observed_at')->paginate(200));
    }
}
