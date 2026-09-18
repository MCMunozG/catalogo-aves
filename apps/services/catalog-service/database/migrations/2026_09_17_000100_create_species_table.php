<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Creates Catalog's editorial species store and its publication/sensitivity policy. */
return new class extends Migration {
    /** Creates the single table owned by this bounded context. */
    public function up(): void
    {
        Schema::create('species', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->string('common_name');
            $t->string('scientific_name')->unique();
            $t->json('taxonomy')->nullable();
            $t->text('description')->nullable();
            $t->string('size')->nullable();
            $t->text('habitat')->nullable();
            $t->text('feeding')->nullable();
            $t->text('distribution')->nullable();
            $t->json('typical_hours')->nullable();
            $t->json('seasons')->nullable();
            $t->json('similar_species')->nullable();
            $t->text('distinguishing_features')->nullable();
            $t->string('conservation_status')->nullable();
            $t->string('sensitivity')->default('EXACT');
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });
    }
    /** Drops Catalog's species table during rollback. */
    public function down(): void
    {
        Schema::dropIfExists('species');
    }
};
