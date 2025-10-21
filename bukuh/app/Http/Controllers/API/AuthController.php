<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $data = $req->validate([
            'name'=>'required','email'=>'required|email|unique:users',
            'password'=>'required|min:6'
        ]);
        $user = User::create([
            'name'=>$data['name'],
            'email'=>$data['email'],
            'password'=>bcrypt($data['password']),
            'role'=>'user'
        ]);
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user],201);
    }

    public function login(Request $req)
    {
        $data = $req->validate(['email'=>'required|email','password'=>'required']);
        $user = User::where('email',$data['email'])->first();
        if (!$user || !Hash::check($data['password'],$user->password)) {
            throw ValidationException::withMessages(['email'=>'Credential salah']);
        }
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user]);
    }

    public function me(Request $r) { return $r->user(); }
    public function logout(Request $r) { $r->user()->currentAccessToken()->delete(); return response()->json(['ok'=>true]); }
}
