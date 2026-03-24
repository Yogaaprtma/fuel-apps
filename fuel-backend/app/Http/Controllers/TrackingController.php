<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryLocation;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    // Driver kirim lokasi terbaru
    public function store(Request $request, Delivery $delivery)
    {
        $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'accuracy'  => 'sometimes|numeric',
            'speed'     => 'sometimes|numeric',
            'heading'   => 'sometimes|numeric',
        ]);

        // Pastikan driver yang benar
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $location = DeliveryLocation::create([
            'delivery_id'   => $delivery->id,
            'driver_id'     => $request->user()->id,
            'latitude'      => $request->latitude,
            'longitude'     => $request->longitude,
            'accuracy'      => $request->accuracy,
            'speed'         => $request->speed,
            'heading'       => $request->heading,
            'status_at_time'=> $delivery->status,
            'recorded_at'   => now(),
        ]);

        // Auto-transition ke NEAR_DESTINATION jika dalam 500m
        $distance = $delivery->calculateDistance($request->latitude, $request->longitude);
        if ($delivery->status === 'IN_TRANSIT' && $distance <= 500) {
            $delivery->update(['status' => 'NEAR_DESTINATION']);
            $delivery->statusLogs()->create([
                'changed_by'  => $request->user()->id,
                'from_status' => 'IN_TRANSIT',
                'to_status'   => 'NEAR_DESTINATION',
                'notes'       => 'Auto-transisi: Driver dalam radius 500m dari tujuan',
                'latitude'    => $request->latitude,
                'longitude'   => $request->longitude,
            ]);
        }

        return response()->json([
            'location' => $location,
            'delivery_status' => $delivery->fresh()->status,
            'distance_to_destination' => round($distance),
        ]);
    }

    // Get history lokasi untuk suatu delivery
    public function history(Delivery $delivery)
    {
        return response()->json([
            'locations' => $delivery->locations()->select(
                'id', 'latitude', 'longitude', 'speed', 'heading', 'status_at_time', 'recorded_at'
            )->get(),
            'latest' => $delivery->latestLocation(),
        ]);
    }
}