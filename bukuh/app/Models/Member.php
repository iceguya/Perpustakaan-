<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = ['member_code','name','email','phone','address'];

    public function user(){ return $this->hasOne(User::class); }
    public function borrows(){ return $this->hasMany(Borrow::class); }
    public function attendances(){ return $this->hasMany(Attendance::class); }
    public function readProgress(){ return $this->hasMany(ReadProgress::class); }
}
