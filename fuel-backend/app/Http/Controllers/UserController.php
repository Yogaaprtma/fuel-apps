<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->role, fn($q) => $q->role($request->role))
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->paginate(15);
        return response()->json($users);
    }

    public function drivers()
    {
        $drivers = User::role('driver')->where('is_active', true)->get(['id', 'name', 'phone']);
        return response()->json($drivers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'phone'    => 'sometimes|string',
            'password' => 'required|min:8',
            'role'     => 'required|in:super-admin,admin-operasional,driver,customer',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return response()->json($user->load('roles'), 201);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'      => 'sometimes|string',
            'phone'     => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'role'      => 'sometimes|in:super-admin,admin-operasional,driver,customer',
        ]);

        $user->update($request->only(['name', 'phone', 'is_active']));

        if ($request->role) {
            $user->syncRoles([$request->role]);
        }

        return response()->json($user->fresh()->load('roles'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri'], 422);
        }

        $user->delete();
        
        return response()->json(['message' => 'User berhasil dihapus']);
    }
}
