<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /** Simpan subscription dari browser */
    public function store(Request $request)
    {
        $request->validate([
            'endpoint'   => 'required|string',
            'p256dh_key' => 'required|string',
            'auth_key'   => 'required|string',
        ]);

        PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id'    => $request->user()->id,
                'p256dh_key' => $request->p256dh_key,
                'auth_key'   => $request->auth_key,
            ]
        );

        return response()->json(['message' => 'Push subscription disimpan']);
    }

    /** Hapus subscription (saat user logout / disable notif) */
    public function destroy(Request $request)
    {
        $request->validate(['endpoint' => 'required|string']);

        PushSubscription::where('endpoint', $request->endpoint)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Push subscription dihapus']);
    }

    /** Kembalikan VAPID public key ke frontend */
    public function vapidKey()
    {
        return response()->json([
            'public_key' => config('services.vapid.public_key', ''),
        ]);
    }
}
