<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Borrow extends Model
{
    protected $fillable = ['member_id','book_id','borrowed_at','due_at','returned_at','status'];

    protected $casts = [
        'borrowed_at'=>'date','due_at'=>'date','returned_at'=>'date'
    ];

    public function member(){ return $this->belongsTo(Member::class); }
    public function book(){ return $this->belongsTo(Book::class); }
}

