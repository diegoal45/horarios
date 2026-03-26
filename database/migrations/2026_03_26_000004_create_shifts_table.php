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
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->enum('day_of_week', ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']);
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_opening')->default(false);
            $table->boolean('is_closing')->default(false);
            $table->integer('hours')->default(0); // Horas trabajadas en el turno
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
