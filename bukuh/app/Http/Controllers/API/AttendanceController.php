<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkin(Request $r)
    {
        $data = $r->validate(['member_id'=>'required|exists:members,id']);
        return Attendance::create([
            'member_id'=>$data['member_id'],
            'checked_in_at'=>now()
        ]);
    }
}
