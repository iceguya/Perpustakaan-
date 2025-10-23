<?php

namespace Database\Seeders;

use App\Models\{Member, User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        for ($i=1; $i<=20; $i++) {
            $member = Member::create([
                'member_code' => 'MBR'.str_pad($i,4,'0',STR_PAD_LEFT),
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'address' => fake()->address()
            ]);

            User::create([
                'name' => $member->name,
                'username' => $member->member_code,
                'email' => $member->email,
                'password' => Hash::make('password'),
                'role' => 'user',
                'member_id' => $member->id,
            ]);
        }
    }
}
