<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        for ($i=1; $i<=20; $i++) {
            Member::create([
                'member_code' => 'MBR'.str_pad($i,4,'0',STR_PAD_LEFT),
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'address' => fake()->address()
            ]);
        }
    }
}
