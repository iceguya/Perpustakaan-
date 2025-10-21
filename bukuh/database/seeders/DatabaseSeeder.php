<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

            \App\Models\User::factory()->create([
        'name' => 'Admin',
        'email' => 'admin@lib.test',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    \App\Models\User::factory()->create([
        'name' => 'User',
        'email' => 'user@lib.test',
        'password' => bcrypt('password'),
        'role' => 'user',
    ]);

    $this->call([
        MemberSeeder::class,
        BookSeeder::class,
    ]);
    }

    
}



