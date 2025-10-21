<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'isbn','title','author','publisher','year','stock','is_digital','file_url'
    ];

    public function borrows(){ return $this->hasMany(Borrow::class); }
}
