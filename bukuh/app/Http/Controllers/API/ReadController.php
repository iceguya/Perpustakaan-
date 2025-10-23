<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Borrow, ReadProgress};
use Illuminate\Http\Request;

class ReadController extends Controller
{
    public function updateProgress(Request $r)
    {
        $data = $r->validate([
            'book_id'=>'required|exists:books,id',
            'current_page'=>'required|integer|min:0',
            'total_pages'=>'required|integer|min:1',
            'member_id'=>'nullable|exists:members,id',
        ]);

        $user = $r->user();
        $member = $user->member;
        $requestedMemberId = $data['member_id'] ?? $member?->id;

        if (!$requestedMemberId) {
            return response()->json(['message' => 'Akun belum terhubung dengan data anggota.'], 422);
        }

        if (($data['member_id'] ?? false) && !$user->can('isAdmin') && $requestedMemberId !== $member?->id) {
            return response()->json(['message' => 'Tidak diizinkan memperbarui progress member lain'], 403);
        }

        $rp = ReadProgress::updateOrCreate(
            ['member_id'=>$requestedMemberId,'book_id'=>$data['book_id']],
            ['current_page'=>$data['current_page'],'total_pages'=>$data['total_pages']]
        );
        return $rp->load('book');
    }

    public function history(Request $r)
    {
        $user = $r->user();
        $member = $user->member;
        $memberId = $r->query('member_id');

        if ($memberId) {
            if (!$user->can('isAdmin')) {
                return response()->json(['message' => 'Tidak diizinkan melihat history member lain'], 403);
            }
        } else {
            $memberId = $member?->id;
        }

        if (!$memberId) {
            return response()->json(['digital' => [], 'physical' => []]);
        }

        $digital = ReadProgress::with('book')
            ->where('member_id', $memberId)
            ->orderByDesc('updated_at')
            ->get();

        $physical = Borrow::with('book')
            ->where('member_id', $memberId)
            ->whereIn('status', ['approved','returned','late'])
            ->orderByDesc('borrowed_at')
            ->get();

        return response()->json([
            'digital' => $digital,
            'physical' => $physical,
        ]);
    }
}
