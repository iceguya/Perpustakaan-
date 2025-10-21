<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['member_id','checked_in_at'];
    protected $casts = ['checked_in_at'=>'datetime'];
    public function member(){ return $this->belongsTo(Member::class); }
}
