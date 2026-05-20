<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /** Simpan subscription dari browser / mobile apps */
    public function store(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        PushSubscription::updateOrCreate(
            ['fcm_token' => $request->fcm_token],
            ['user_id'   => $request->user()->id]
        );

        return response()->json(['message' => 'FCM Token disimpan']);
    }

    /** Hapus subscription (saat user logout / disable notif) */
    public function destroy(Request $request)
    {
        $request->validate(['fcm_token' => 'required|string']);

        PushSubscription::where('fcm_token', $request->fcm_token)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'FCM Token dihapus']);
    }
    }
}
