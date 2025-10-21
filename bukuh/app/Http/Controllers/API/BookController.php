<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class BookController extends Controller
{
    public function index(Request $r)
    {
        $books = QueryBuilder::for(Book::class)
            ->allowedFilters([
                AllowedFilter::partial('title'),
                AllowedFilter::partial('author'),
                AllowedFilter::exact('year'),
                AllowedFilter::scope('q') // optional kalau bikin scope
            ])
            ->allowedSorts(['title','year','author'])
            ->paginate(12);
        return $books;
    }

    public function show(Book $book){ return $book; }
}
