<?php

namespace Tests\Unit;

use App\Services\LocationPrivacy;
use PHPUnit\Framework\TestCase;

class LocationPrivacyTest extends TestCase
{
    public function test_hidden_location_never_contains_coordinates(): void
    {
        $data = (new LocationPrivacy)->sanitize(4.6789123, -74.056789, 'HIDDEN', 'Bogotá');
        self::assertNull($data['public_lat']);
        self::assertNull($data['public_lng']);
        self::assertSame('Bogotá', $data['public_region']);
    }
    public function test_approximate_location_is_not_the_private_point(): void
    {
        $data = (new LocationPrivacy)->sanitize(4.6789123, -74.056789, 'APPROXIMATE');
        self::assertNotSame(4.6789123, $data['public_lat']);
        self::assertNotSame(-74.056789, $data['public_lng']);
    }
}
