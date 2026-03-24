<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('delivery_code')->unique();
            $table->foreignId('admin_id')->constrained('users');
            $table->foreignId('driver_id')->nullable()->constrained('users');
            $table->foreignId('customer_id')->nullable()->constrained('users');

            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('destination_address');
            $table->decimal('destination_lat', 10, 8);
            $table->decimal('destination_lng', 11, 8);
            $table->integer('geofence_radius')->default(200);

            $table->enum('fuel_type', ['PERTALITE', 'PERTAMAX', 'PERTAMAX_TURBO', 'SOLAR', 'DEXLITE']);
            $table->decimal('volume_liters', 10, 2);
            $table->decimal('price_per_liter', 10, 2);
            $table->decimal('total_price', 15, 2);

            $table->enum('status', ['CREATED', 'PACKED', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED', 'COMPLETED'])->default('CREATED');
            $table->text('notes')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
