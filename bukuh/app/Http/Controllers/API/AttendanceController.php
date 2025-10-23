<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkin(Request $r)
    {
        $data = $r->validate([
            'member_id' => 'nullable|exists:members,id',
        ]);

        $user = $r->user();
        $member = $user->member;

        $memberId = $data['member_id'] ?? $member?->id;

        if (!$memberId) {
            return response()->json(['message' => 'Member tidak ditemukan untuk akun ini'], 422);
        }

        if ($data['member_id'] ?? false) {
            if (!$user->can('isAdmin') && $memberId !== $member?->id) {
                return response()->json(['message' => 'Tidak diizinkan melakukan check-in untuk member lain'], 403);
            }
        }

        $attendance = Attendance::where('member_id', $memberId)
            ->whereDate('checked_in_at', today())
            ->first();

        if ($attendance) {
            $attendance->update(['checked_in_at' => now()]);
        } else {
            $attendance = Attendance::create([
                'member_id' => $memberId,
                'checked_in_at' => now(),
            ]);
        }

        return $attendance->load('member');
    }
}
