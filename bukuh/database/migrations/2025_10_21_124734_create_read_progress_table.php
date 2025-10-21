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
    Schema::create('read_progress', function (Blueprint $table) {
        $table->id();
        $table->foreignId('member_id')->constrained()->cascadeOnDelete();
        $table->foreignId('book_id')->constrained()->cascadeOnDelete();
        $table->integer('current_page')->default(0);
        $table->integer('total_pages')->default(0);
        $table->timestamps();

        $table->unique(['member_id','book_id']);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('read_progress');
    }
};
