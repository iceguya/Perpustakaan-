<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Borrow extends Model
{
    protected $fillable = [
        'member_id',
        'book_id',
        'borrowed_at',
        'due_at',
        'returned_at',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'borrowed_at' => 'datetime',
        'due_at' => 'datetime',
        'returned_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function member(){ return $this->belongsTo(Member::class); }
    public function book(){ return $this->belongsTo(Book::class); }
    public function requestedBy(){ return $this->belongsTo(User::class, 'requested_by'); }
    public function approvedBy(){ return $this->belongsTo(User::class, 'approved_by'); }
}
