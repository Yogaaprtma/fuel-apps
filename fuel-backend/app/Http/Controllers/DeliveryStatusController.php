<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryStatusLog;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;

class DeliveryStatusController extends Controller
{
    public function update(Request $request, Delivery $delivery)
    {
        $request->validate([
            'status'    => 'required|string',
            'notes'     => 'sometimes|nullable|string',
            'latitude'  => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
        ]);

        $newStatus = $request->status;

        if (!$delivery->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "Status tidak valid. Status saat ini: {$delivery->status}, harus ke: " . Delivery::STATUS_FLOW[$delivery->status]
            ], 422);
        }

        if ($newStatus === 'DELIVERED') {
            if (!$request->latitude || !$request->longitude) {
                return response()->json([
                    'message' => 'GPS diperlukan untuk konfirmasi pengiriman'
                ], 422);
            }

            $distance = $delivery->calculateDistance($request->latitude, $request->longitude);

            if (!$delivery->isWithinGeofence($request->latitude, $request->longitude)) {
                return response()->json([
                    'message'         => "Driver berada di luar area pengiriman. Jarak: " . round($distance) . "m, radius: {$delivery->geofence_radius}m",
                    'distance'        => $distance,
                    'geofence_radius' => $delivery->geofence_radius,
                ], 422);
            }
        }

        $oldStatus = $delivery->status;
        $delivery->update(['status' => $newStatus]);

        DeliveryStatusLog::create([
            'delivery_id' => $delivery->id,
            'changed_by'  => $request->user()->id,
            'from_status' => $oldStatus,
            'to_status'   => $newStatus,
            'notes'       => $request->notes,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
        ]);

        // Kirim notifikasi WhatsApp ke customer (async fire-and-forget)
        try {
            $wa = new WhatsAppService();
            $delivery->load('driver:id,name');
            $wa->send(
                $delivery->customer_phone,
                $wa->getStatusMessage($newStatus, [
                    'delivery_code' => $delivery->delivery_code,
                    'driver_name'   => $delivery->driver?->name ?? 'Driver',
                    'address'       => $delivery->destination_address,
                    'total_price'   => $delivery->total_price,
                ])
            );
        } catch (\Exception $e) {
            // WA gagal tidak boleh hentikan proses utama
        }

        return response()->json([
            'message'  => 'Status berhasil diupdate',
            'delivery' => $delivery->fresh()->load('statusLogs.user:id,name'),
        ]);
    }
}
