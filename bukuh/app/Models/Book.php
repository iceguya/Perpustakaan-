<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'isbn','title','author','publisher','year','stock','is_digital','file_url'
    ];

    public function borrows(){ return $this->hasMany(Borrow::class); }

    public function scopeQ($query, $value)
    {
        $term = trim($value);
        if ($term === '') {
            return $query;
        }

        $needle = mb_strtolower($term, 'UTF-8');
        $like = '%'.$needle.'%';

        return $query->where(function ($inner) use ($like) {
            $inner->whereRaw('LOWER(title) LIKE ?', [$like])
                ->orWhereRaw('LOWER(author) LIKE ?', [$like])
                ->orWhereRaw('LOWER(isbn) LIKE ?', [$like])
                ->orWhereRaw('LOWER(publisher) LIKE ?', [$like]);
        });
    }
}
