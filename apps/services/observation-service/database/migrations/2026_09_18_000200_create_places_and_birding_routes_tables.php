<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Crea el catálogo público de lugares y recorridos, propiedad de Observation. */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name'); $table->string('municipality'); $table->string('department'); $table->string('habitat');
            $table->text('description'); $table->decimal('latitude', 10, 7); $table->decimal('longitude', 10, 7);
            $table->boolean('is_public')->default(true)->index(); $table->timestamps();
        });
        Schema::create('birding_routes', function (Blueprint $table) {
            $table->ulid('id')->primary(); $table->ulid('place_id')->index(); $table->string('name'); $table->string('difficulty');
            $table->unsignedSmallInteger('duration_minutes'); $table->decimal('distance_km', 5, 2); $table->text('description');
            $table->decimal('start_latitude', 10, 7); $table->decimal('start_longitude', 10, 7);
            $table->boolean('is_public')->default(true)->index(); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('birding_routes'); Schema::dropIfExists('places'); }
};
