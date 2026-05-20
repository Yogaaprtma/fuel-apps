<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Akun Anda dinonaktifkan'], 403);
        }

        if ($user->two_factor_enabled) {
            return response()->json([
                'message'      => '2FA Required',
                '2fa_required' => true,
                'user_id'      => $user->id
            ], 200);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'roles' => $user->getRoleNames(),
                'is_active' => $user->is_active,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Berhasil logout'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'roles' => $user->getRoleNames(),
            'is_active' => $user->is_active,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|image|max:2048',
            'current_password' => 'required_with:new_password',
            'new_password' => 'sometimes|min:8|confirmed',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        if ($request->current_password) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Password lama salah'], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->fill($request->only(['name', 'phone']));
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diupdate', 
            'user' => $user
        ]);
    }

    public function verify2fa(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp'     => 'required|numeric',
        ]);

        $user = User::find($request->user_id);
        $google2fa = app('pragmarx.google2fa');
        
        $valid = $google2fa->verifyKey($user->google2fa_secret, $request->otp);

        if (!$valid) {
            return response()->json(['message' => 'Kode OTP salah'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'avatar_url' => $user->avatar_url,
                'roles'      => $user->getRoleNames(),
                'is_active'  => $user->is_active,
            ]
        ]);
    }

    public function setup2fa(Request $request)
    {
        $user = $request->user();
        $google2fa = app('pragmarx.google2fa');

        $secret = $google2fa->generateSecretKey();
        $user->google2fa_secret = $secret;
        $user->save();

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret'      => $secret,
            'qr_code_url' => $qrCodeUrl
        ]);
    }

    public function enable2fa(Request $request)
    {
        $user = $request->user();
        $request->validate(['otp' => 'required|numeric']);

        $google2fa = app('pragmarx.google2fa');
        $valid = $google2fa->verifyKey($user->google2fa_secret, $request->otp);

        if (!$valid) {
            return response()->json(['message' => 'Kode OTP salah'], 400);
        }

        $user->two_factor_enabled = true;
        $user->save();

        return response()->json(['message' => '2FA berhasil diaktifkan']);
    }
}