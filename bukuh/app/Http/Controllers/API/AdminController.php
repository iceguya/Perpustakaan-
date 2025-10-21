<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Book,Member};
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // CRUD Buku
    public function index() { return Book::latest()->paginate(20); }
    public function store(Request $r) {
        $data = $r->validate([
            'isbn'=>'required|unique:books,isbn',
            'title'=>'required','author'=>'nullable','publisher'=>'nullable',
            'year'=>'nullable|integer','stock'=>'required|integer|min:0',
            'is_digital'=>'boolean','file_url'=>'nullable|url'
        ]);
        return Book::create($data);
    }
    public function show(Book $book) { return $book; }
    public function update(Request $r, Book $book) {
        $data = $r->validate([
            'isbn'=>"required|unique:books,isbn,{$book->id}",
            'title'=>'required','author'=>'nullable','publisher'=>'nullable',
            'year'=>'nullable|integer','stock'=>'required|integer|min:0',
            'is_digital'=>'boolean','file_url'=>'nullable|url'
        ]);
        $book->update($data); return $book;
    }
    public function destroy(Book $book) { $book->delete(); return response()->noContent(); }

    // Anggota
    public function members() { return Member::latest()->paginate(20); }
    public function storeMember(Request $r){
        $data=$r->validate([
            'member_code'=>'required|unique:members',
            'name'=>'required','email'=>'nullable|email|unique:members,email',
            'phone'=>'nullable','address'=>'nullable'
        ]);
        return Member::create($data);
    }
    public function updateMember(Request $r, Member $member){
        $data=$r->validate([
            'member_code'=>"required|unique:members,member_code,{$member->id}",
            'name'=>'required','email'=>"nullable|email|unique:members,email,{$member->id}",
            'phone'=>'nullable','address'=>'nullable'
        ]);
        $member->update($data); return $member;
    }
    public function destroyMember(Member $member){ $member->delete(); return response()->noContent(); }

    // Laporan cepat
    public function reportSummary() {
        return [
            'total_books'=>Book::count(),
            'total_members'=>Member::count(),
            'borrowed_today'=>\App\Models\Borrow::whereDate('borrowed_at',today())->count(),
        ];
    }
}
