<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadProgress extends Model
{
    protected $table = 'read_progress';
    protected $fillable = ['member_id','book_id','current_page','total_pages'];

    public function member(){ return $this->belongsTo(Member::class); }
    public function book(){ return $this->belongsTo(Book::class); }
}

