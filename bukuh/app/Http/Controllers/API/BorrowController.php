<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Borrow,Book,Member};
use Illuminate\Http\Request;

class BorrowController extends Controller
{
    public function index() {
        return Borrow::with(['member','book'])->latest()->paginate(20);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'member_id'=>'required|exists:members,id',
            'book_id'=>'required|exists:books,id',
            'days'=>'nullable|integer|min:1|max:30'
        ]);
        $book = Book::findOrFail($data['book_id']);
        if ($book->stock < 1) {
            return response()->json(['message'=>'Stock habis'], 422);
        }
        $borrow = Borrow::create([
            'member_id'=>$data['member_id'],
            'book_id'=>$data['book_id'],
            'borrowed_at'=>now(),
            'due_at'=>now()->addDays($data['days'] ?? 7),
            'status'=>'borrowed'
        ]);
        $book->decrement('stock');
        return $borrow->load(['member','book']);
    }

    public function returnBook(Borrow $borrow)
    {
        if ($borrow->returned_at) return response()->json(['message'=>'Sudah dikembalikan'],422);
        $borrow->update([
            'returned_at'=>now(),
            'status'=>now()->gt($borrow->due_at)?'late':'returned'
        ]);
        $borrow->book()->increment('stock');
        return $borrow->refresh()->load(['member','book']);
    }

    public function myBorrows(Request $r)
    {
        // asumsi user terhubung ke member via email sama? Sesuaikan ke kebutuhanmu.
        return Borrow::with('book')->latest()->paginate(10);
    }
}
