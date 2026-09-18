<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Conserva una referencia humana privada para que la bitácora no tenga que mostrar coordenadas ni ids. */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('sightings', function (Blueprint $table) {
            $table->string('private_region')->nullable()->after('private_lng');
        });

        DB::table('sightings')->whereNull('private_region')->update(['private_region' => DB::raw('public_region')]);
    }

    public function down(): void
    {
        Schema::table('sightings', function (Blueprint $table) {
            $table->dropColumn('private_region');
        });
    }
};
