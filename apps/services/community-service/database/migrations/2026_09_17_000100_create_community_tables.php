<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Creates Community-owned interaction, moderation and notification tables. */
return new class extends Migration {
    /** Creates all local tables; external entity references intentionally have no foreign keys. */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('author_id')->index();
            $t->text('body')->nullable();
            $t->string('reference_type');
            $t->ulid('reference_id');
            $t->string('visibility')->default('PUBLIC');
            $t->timestamps();
        });
        Schema::create('comments', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('post_id')->index();
            $t->ulid('author_id')->index();
            $t->text('body');
            $t->timestamps();
        });
        Schema::create('reactions', function (Blueprint $t) {
            $t->id();
            $t->ulid('post_id');
            $t->ulid('user_id');
            $t->string('reaction');
            $t->timestamps();
            $t->unique(['post_id', 'user_id']);
        });
        Schema::create('follows', function (Blueprint $t) {
            $t->id();
            $t->ulid('follower_id');
            $t->ulid('followed_id');
            $t->timestamps();
            $t->unique(['follower_id', 'followed_id']);
        });
        Schema::create('reports', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('reporter_id');
            $t->string('target_type');
            $t->ulid('target_id');
            $t->string('reason');
            $t->text('detail')->nullable();
            $t->string('status');
            $t->timestamps();
        });
        Schema::create('audit_records', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('actor_id');
            $t->string('target_type');
            $t->ulid('target_id');
            $t->string('action');
            $t->text('reason');
            $t->timestamps();
        });
        Schema::create('notifications', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('user_id')->index();
            $t->string('type');
            $t->ulid('reference_id')->nullable();
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });
    }
    /** Reverses creation in dependency-safe order. */
    public function down(): void
    {
        foreach (['notifications', 'audit_records', 'reports', 'follows', 'reactions', 'comments', 'posts'] as $t) Schema::dropIfExists($t);
    }
};
