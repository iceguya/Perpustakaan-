<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('users', 'member_id')) {
                $table->foreignId('member_id')->nullable()->after('role')->constrained()->cascadeOnDelete();
            }
        });

        // Allow email to be nullable so anggota tanpa email tetap bisa dibuat.
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });

        // Pastikan setiap user eksisting memiliki username yang unik.
        DB::table('users')->orderBy('id')->get()->each(function ($user) {
            $base = null;

            if (!empty($user->username)) {
                return;
            }

            if (!empty($user->email)) {
                $base = explode('@', $user->email)[0];
            }

            if (!$base) {
                $base = Str::slug($user->name ?? '', '_');
            }

            if (!$base) {
                $base = 'user';
            }

            $candidate = $base;
            $suffix = 1;
            while (DB::table('users')->where('username', $candidate)->exists()) {
                $candidate = sprintf('%s_%d', $base, $suffix++);
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update(['username' => $candidate]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'member_id')) {
                $table->dropConstrainedForeignId('member_id');
            }
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique('users_username_unique');
                $table->dropColumn('username');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });
    }
};
