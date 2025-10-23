<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1) pastikan kolom status bertipe string dan default 'pending'
        Schema::table('borrows', function (Blueprint $table) {
            // butuh doctrine/dbal kalau mau change(): composer require doctrine/dbal
            $table->string('status', 20)->default('pending')->change();
        });

        // 2) hapus constraint lama yang bikin drama
        DB::statement("ALTER TABLE borrows DROP CONSTRAINT IF EXISTS borrows_status_check;");

        // 3) pasang constraint baru yang mengizinkan status yang kita pakai
        DB::statement("
            ALTER TABLE borrows
            ADD CONSTRAINT borrows_status_check
            CHECK (status IN ('pending','approved','rejected','returned','late'))
        ");
    }

    public function down(): void
    {
        // Bebaskan dulu constraint baru
        DB::statement("ALTER TABLE borrows DROP CONSTRAINT IF EXISTS borrows_status_check;");

        // Kembalikan default minimal agar tidak meledak saat rollback
        Schema::table('borrows', function (Blueprint $table) {
            $table->string('status', 20)->default('approved')->change();
        });

        // Optional: pasang lagi constraint lama (kalau kamu ingat isinya). Kalau tidak, biarkan tanpa constraint.
        // DB::statement("ALTER TABLE borrows ADD CONSTRAINT borrows_status_check CHECK (status IN ('approved','returned','late'))");
    }
};
