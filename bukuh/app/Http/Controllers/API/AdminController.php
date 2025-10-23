<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Book,Borrow,Member,ReadProgress,User};
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
    public function members() { return Member::with('user')->latest()->paginate(20); }
    public function storeMember(Request $r){
        $data=$r->validate([
            'member_code'=>['required', Rule::unique('members','member_code')],
            'name'=>['required','string'],
            'email'=>['nullable','email', Rule::unique('members','email'), Rule::unique('users','email')],
            'phone'=>['nullable','string'],
            'address'=>['nullable','string'],
            'password'=>['nullable','min:6'],
        ]);

        $memberData = collect($data)->except('password')->all();
        $member = Member::create($memberData);

        $plainPassword = $data['password'] ?? Str::random(10);

        $user = User::create([
            'name' => $member->name,
            'username' => $member->member_code,
            'email' => $member->email,
            'password' => bcrypt($plainPassword),
            'role' => 'user',
            'member_id' => $member->id,
        ]);

        return response()->json([
            'member' => $member->load('user'),
            'default_password' => $data['password'] ? null : $plainPassword,
        ], 201);
    }
    public function updateMember(Request $r, Member $member){
        $data=$r->validate([
            'member_code'=>['required', Rule::unique('members','member_code')->ignore($member->id)],
            'name'=>['required','string'],
            'email'=>['nullable','email', Rule::unique('members','email')->ignore($member->id), Rule::unique('users','email')->ignore(optional($member->user)->id)],
            'phone'=>['nullable','string'],
            'address'=>['nullable','string'],
            'password'=>['nullable','min:6'],
        ]);

        $memberData = collect($data)->except('password')->all();
        $member->update($memberData);

        $user = $member->user;
        $defaultPassword = null;

        if ($user) {
            $user->update([
                'name' => $member->name,
                'username' => $member->member_code,
                'email' => $member->email,
                'member_id' => $member->id,
            ]);

            if (!empty($data['password'])) {
                $user->update(['password' => bcrypt($data['password'])]);
            }
        } else {
            $password = $data['password'] ?? Str::random(10);
            $defaultPassword = $data['password'] ? null : $password;
            $user = User::create([
                'name' => $member->name,
                'username' => $member->member_code,
                'email' => $member->email,
                'password' => bcrypt($password),
                'role' => 'user',
                'member_id' => $member->id,
            ]);
        }

        return response()->json([
            'member' => $member->load('user'),
            'default_password' => $defaultPassword,
        ]);
    }
    public function destroyMember(Member $member){ $member->delete(); return response()->noContent(); }

    // Laporan cepat
    public function reportSummary() {
        $today = today();
        return [
            'total_books'=>Book::count(),
            'total_members'=>Member::count(),
            'pending_requests'=>Borrow::where('status','pending')->count(),
            'active_borrows'=>Borrow::where('status','approved')->count(),
            'borrowed_today'=>Borrow::whereDate('borrowed_at',$today)->count(),
            'digital_sessions_today'=>ReadProgress::whereDate('updated_at',$today)->count(),
        ];
    }
}
