<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rated_by')->constrained('users')->cascadeOnDelete(); // user yang memberi rating (customer)
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete(); // driver yang dinilai
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique('delivery_id'); // 1 delivery hanya boleh 1 rating
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_ratings');
    }
};
