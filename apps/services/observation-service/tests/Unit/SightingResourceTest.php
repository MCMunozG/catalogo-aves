<?php

namespace Tests\Unit;

use App\Http\Resources\SightingResource;
use Illuminate\Http\Request;
use PHPUnit\Framework\TestCase;

class SightingResourceTest extends TestCase
{
    public function test_public_projection_never_serializes_private_coordinates(): void
    {
        $data = (new SightingResource($this->sighting()))->resolve(Request::create('/'));

        self::assertSame(4.7, $data['latitude']);
        self::assertArrayNotHasKey('private_location', $data);
    }

    public function test_owner_projection_includes_private_coordinates(): void
    {
        $data = (new SightingResource($this->sighting(), true))->resolve(Request::create('/'));

        self::assertSame(['latitude' => 4.711, 'longitude' => -74.072], $data['private_location']);
    }

    private function sighting(): object
    {
        return (object) [
            'id' => '01J00000000000000000000000',
            'species_id' => null,
            'observed_at' => '2026-09-17T12:00:00Z',
            'individuals' => 1,
            'behavior' => null,
            'status' => 'PUBLISHED',
            'sensitivity' => 'EXACT',
            'public_region' => null,
            'private_lat' => 4.711,
            'private_lng' => -74.072,
            'public_lat' => 4.7,
            'public_lng' => -74.1,
        ];
    }
}
