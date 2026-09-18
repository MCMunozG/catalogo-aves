<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class SensitivityContractTest extends TestCase
{
    public function test_supported_sensitivities_are_explicit(): void
    {
        self::assertSame(['EXACT', 'APPROXIMATE', 'HIDDEN'], ['EXACT', 'APPROXIMATE', 'HIDDEN']);
    }
}
