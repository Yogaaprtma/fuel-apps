<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;

class ProofOfDeliveryController extends Controller
{
    public function store(Request $request, Delivery $delivery)
    {
        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'signature'      => 'required|string',
            'photo'          => 'sometimes|image|max:5120',
            'latitude'       => 'required|numeric',
            'longitude'      => 'required|numeric',
        ]);

        if ($delivery->proof) {
            return response()->json(['message' => 'Bukti pengiriman sudah ada'], 422);
        }

        // Bug #6 Fix: POD hanya bisa disubmit ketika status DELIVERED
        if ($delivery->status !== 'DELIVERED') {
            return response()->json([
                'message' => 'Bukti pengiriman hanya bisa disubmit ketika status delivery adalah DELIVERED. Status saat ini: ' . $delivery->status
            ], 422);
        }

        $distance = $delivery->calculateDistance($request->latitude, $request->longitude);
        $geofenceValid = $delivery->isWithinGeofence($request->latitude, $request->longitude);

        $signaturePath = 'signatures/' . uniqid() . '.png';
        $signatureData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->signature));
        \Storage::disk('public')->put($signaturePath, $signatureData);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('proof-photos', 'public');
        }

        $proof = $delivery->proof()->create([
            'recipient_name'           => $request->recipient_name,
            'signature_path'           => $signaturePath,
            'photo_path'               => $photoPath,
            'latitude'                 => $request->latitude,
            'longitude'                => $request->longitude,
            'distance_from_destination'=> round($distance, 2),
            'geofence_valid'           => $geofenceValid,
            'signed_at'                => now(),
        ]);

        return response()->json($proof, 201);
    }

    public function show(Delivery $delivery)
    {
        return response()->json($delivery->proof ?? ['message' => 'Belum ada bukti pengiriman']);
    }
}
