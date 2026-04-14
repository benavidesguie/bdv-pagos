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
        Schema::create('ordenes_pago', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('order_id');
            $table->string('telefono', 20);
            $table->decimal('monto', 10, 2)->default(0);
            $table->decimal('monto_bs', 10, 2)->default(0);
            $table->string('status', 20)->default('pending'); // pending, paid, cancelled
            $table->jsonb('bdv_response')->nullable();
            $table->timestamps();

            $table->foreign('order_id')
                  ->references('id')
                  ->on('orders')
                  ->onDelete('cascade');

            $table->index('status');
            $table->index('order_id');
            $table->index('telefono');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ordenes_pago');
    }
};
