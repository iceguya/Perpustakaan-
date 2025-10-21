<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $books = [];
        for ($i=1; $i<=100; $i++) {
            $books[] = [
                'isbn' => '978'.str_pad((string)random_int(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'title' => "Buku Ke-$i",
                'author' => fake()->name(),
                'publisher' => fake()->company(),
                'year' => fake()->numberBetween(1995, 2025),
                'stock' => fake()->numberBetween(1, 10),
                'is_digital' => fake()->boolean(30),
                'file_url' => null,
                'created_at'=>now(),
                'updated_at'=>now()
            ];
        }
        Book::insert($books);
    }
}
