<?php

namespace App\Domain\Catalog;

use Illuminate\Support\Facades\Http;

/**
 * Capa anticorrupción de sólo lectura para el contrato de Catalog.
 */
class CatalogSensitivityClient
{
    /**
     * @return string|null Sensibilidad validada o null cuando Catalog, red o contrato no son confiables.
     */
    public function sensitivityFor(string $speciesId, ?string $correlationId = null): ?string
    {
        try {
            $request = Http::acceptJson()->timeout((int) config('catalogo_aves.catalog_timeout_seconds', 2));

            if ($correlationId) {
                $request = $request->withHeaders(['X-Request-Id' => $correlationId]);
            }

            $response = $request->get(
                rtrim(config('catalogo_aves.catalog_url'), '/') . '/api/catalog/v1/species/' . $speciesId,
            );

            $sensitivity = $response->successful() ? $response->json('sensitivity') : null;

            return in_array($sensitivity, ['EXACT', 'APPROXIMATE', 'HIDDEN'], true) ? $sensitivity : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
