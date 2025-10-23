<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Borrow, Book, Member};
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class BorrowController extends Controller
{
    // ADMIN: list borrows (dengan filter status optional)
    public function index(Request $r)
    {
        $q = Borrow::with(['member','book']);
        if ($status = $r->query('status')) {
            $q->where('status', $status);
        }
        if ($memberId = $r->query('member_id')) {
            $q->where('member_id', $memberId);
        }
        if ($bookId = $r->query('book_id')) {
            $q->where('book_id', $bookId);
        }
        if ($from = $r->query('from')) {
            $q->whereDate('borrowed_at', '>=', $from);
        }
        if ($to = $r->query('to')) {
            $q->whereDate('borrowed_at', '<=', $to);
        }
        return $q->latest('borrowed_at')->paginate(20);
    }

    // USER: ajukan peminjaman (tidak mengurangi stok)
    public function requestBorrow(Request $r)
    {
        $data = $r->validate([
            'book_id'   => 'required|exists:books,id',
            'member_id' => 'nullable|exists:members,id',
        ]);

        $authUser = $r->user();
        $member = $authUser->member;
        if (!empty($data['member_id'])) {
            if (!$authUser->can('isAdmin') && (!$member || $member->id !== (int) $data['member_id'])) {
                return response()->json(['message' => 'Tidak diizinkan mengajukan untuk member lain'], 403);
            }
            $member = Member::find($data['member_id']);
        }

        if (!$member) {
            return response()->json(['message' => 'Akun belum terhubung dengan data anggota.'], 422);
        }

        $exists = Borrow::where('member_id', $member->id)
            ->where('book_id', $data['book_id'])
            ->whereIn('status', ['pending','approved'])
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'Masih ada peminjaman/request aktif untuk buku ini'], 422);
        }

        $book = Book::findOrFail($data['book_id']);
        if ($book->stock < 1) {
            return response()->json(['message' => 'Stok buku sedang tidak tersedia'], 422);
        }

        $borrow = Borrow::create([
            'member_id'   => $member->id,
            'book_id'     => $data['book_id'],
            'borrowed_at' => null,
            'due_at'      => null,
            'status'      => 'pending',
            'requested_by'=> $authUser->id
        ]);

        return response()->json([
            'message' => 'Permintaan peminjaman dibuat. Menunggu persetujuan admin.',
            'borrow'  => $borrow->load(['member','book'])
        ], 201);
    }

    // ADMIN: approve peminjaman, baru kurangi stok
    public function approve(Request $r, Borrow $borrow)
    {
        $data = $r->validate([
            'due_at' => 'nullable|date|after_or_equal:today',
            'loan_days' => 'nullable|integer|min:1|max:30',
        ]);

        if ($borrow->status !== 'pending') {
            return response()->json(['message'=>'Hanya request pending yang bisa di-approve'], 422);
        }

        return DB::transaction(function () use ($borrow, $r, $data) {
            $book = $borrow->book()->lockForUpdate()->first();
            if ($book->stock < 1) {
                return response()->json(['message'=>'Stok habis'], 422);
            }

            $dueDate = isset($data['due_at']) ? Carbon::parse($data['due_at']) : $borrow->due_at;
            if (!$dueDate && !empty($data['loan_days'])) {
                $dueDate = now()->addDays($data['loan_days']);
            }
            if (!$dueDate) {
                $dueDate = now()->addDays(7);
            }

            $borrow->update([
                'status'      => 'approved',
                'borrowed_at' => now(),
                'due_at'      => $dueDate,
                'approved_by' => $r->user()->id,
                'approved_at' => now(),
            ]);

            $book->decrement('stock');

            return $borrow->refresh()->load(['member','book']);
        });
    }

    // ADMIN: tolak peminjaman
    public function reject(Request $r, Borrow $borrow)
    {
        if ($borrow->status !== 'pending') {
            return response()->json(['message'=>'Hanya request pending yang bisa ditolak'], 422);
        }
        $borrow->update([
            'status'      => 'rejected',
            'approved_by' => $r->user()->id,
            'approved_at' => now(),
        ]);
        return $borrow->refresh()->load(['member','book']);
    }

    // USER/ADMIN: kembalikan buku (hanya yang approved)
    public function returnBook(Request $r, Borrow $borrow)
    {
        $user = $r->user();
        $member = $user->member;

        $isOwner = $member && $borrow->member_id === $member->id;
        $isAdmin = $user->can('isAdmin');

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Tidak berhak mengembalikan peminjaman ini'], 403);
        }

        if (!in_array($borrow->status, ['approved'])) {
            return response()->json(['message'=>'Tidak ada peminjaman aktif'], 422);
        }
        if ($borrow->returned_at) {
            return response()->json(['message'=>'Sudah dikembalikan'], 422);
        }

        return DB::transaction(function () use ($borrow) {
            $borrow->update([
                'returned_at' => now(),
                'status'      => now()->gt($borrow->due_at) ? 'late' : 'returned'
            ]);

            $borrow->book()->increment('stock');
            return $borrow->refresh()->load(['member','book']);
        });
    }

    // USER: daftar peminjaman milik saya (atau semua untuk demo)
    public function myBorrows(Request $r)
    {
        $query = Borrow::with(['book','member']);
        $member = $r->user()->member;

        if ($member) {
            $query->where('member_id', $member->id);
        } elseif ($r->user()->can('isAdmin')) {
            if ($status = $r->query('status')) {
                $query->where('status', $status);
            }
            if ($memberId = $r->query('member_id')) {
                $query->where('member_id', $memberId);
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        return $query->orderByDesc('borrowed_at')->orderByDesc('created_at')->paginate(10);
    }
}
