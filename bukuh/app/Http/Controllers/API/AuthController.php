<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\{Member, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $data = $req->validate([
            'name' => 'required|string',
            'username' => 'nullable|string|unique:users,username',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|min:6',
            'member_code' => 'nullable|exists:members,member_code',
            'role' => 'in:user,admin'
        ]);

        $memberId = null;
        if (!empty($data['member_code'])) {
            $member = Member::where('member_code', $data['member_code'])->firstOrFail();
            if ($member->user) {
                throw ValidationException::withMessages(['member_code' => 'Member sudah memiliki akun.']);
            }
            $memberId = $member->id;
        }

        $username = $data['username'] ?? null;
        if (!$username) {
            if (!empty($data['member_code'])) {
                $username = $data['member_code'];
            } elseif (!empty($data['email'])) {
                $username = explode('@', $data['email'])[0];
            } else {
                $username = Str::slug($data['name'], '.');
            }

            $base = $username ?: 'user';
            $candidate = $base;
            $suffix = 1;
            while (User::where('username', $candidate)->exists()) {
                $candidate = sprintf('%s%d', $base, $suffix++);
            }
            $username = $candidate;
        }

        $user = User::create([
            'name' => $data['name'],
            'username' => $username,
            'email' => $data['email'] ?? null,
            'password' => bcrypt($data['password']),
            'role' => $data['role'] ?? 'user',
            'member_id' => $memberId,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user->load('member')], 201);
    }

    public function login(Request $req)
    {
        $data = $req->validate([
            'identifier' => 'nullable|string', // bisa username, email, atau member_code
            'email' => 'nullable|string',
            'password' => 'required|string',
        ]);

        $identifier = $data['identifier'] ?? $data['email'] ?? null;
        if (!$identifier) {
            throw ValidationException::withMessages(['identifier' => 'Masukkan username / email / member code']);
        }

        $user = User::where('username', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        if (!$user) {
            $member = Member::where('member_code', $identifier)
                ->with('user')
                ->first();
            $user = $member?->user;
        }

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['identifier' => 'Kredensial salah']);
        }
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user->load('member')]);
    }

    public function me(Request $r) { return $r->user()->load('member'); }
    public function logout(Request $r) {
        if ($token = $r->user()->currentAccessToken()) {
            $token->delete();
        }
        return response()->json(['ok'=>true]);
    }
}
