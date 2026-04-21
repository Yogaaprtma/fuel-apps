<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Delivery::with(['admin:id,name', 'driver:id,name', 'latestLocation']);

        if ($user->hasRole('driver')) {
            $query->where('driver_id', $user->id);
        } elseif ($user->hasRole('customer')) {
            $query->where('customer_id', $user->id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('delivery_code', 'like', "%{$request->search}%")
                    ->orWhere('customer_name', 'like', "%{$request->search}%");
            });
        }

        $deliveries = $query->latest()->paginate(15);
        return response()->json($deliveries);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_id'           => 'required|exists:users,id',
            'customer_id'         => 'sometimes|nullable|exists:users,id',  // opsional, untuk link ke akun customer
            'customer_name'       => 'required|string|max:255',
            'customer_phone'      => 'required|string|max:20',
            'destination_address' => 'required|string',
            'destination_lat'     => 'required|numeric',
            'destination_lng'     => 'required|numeric',
            'geofence_radius'     => 'sometimes|integer|min:50|max:1000',
            'fuel_type'           => 'required|in:PERTALITE,PERTAMAX,PERTAMAX_TURBO,SOLAR,DEXLITE',
            'volume_liters'       => 'required|numeric|min:1',
            'price_per_liter'     => 'required|numeric|min:0',
            'notes'               => 'sometimes|nullable|string',
            'scheduled_at'        => 'sometimes|date',
        ]);

        // Validasi driver harus punya role 'driver'
        $driver = \App\Models\User::find($request->driver_id);
        if (!$driver || !$driver->hasRole('driver')) {
            return response()->json(['message' => 'User yang dipilih bukan driver'], 422);
        }

        $delivery = Delivery::create([
            ...$validated,
            'admin_id'      => $request->user()->id,
            'delivery_code' => Delivery::generateCode(),
            'total_price'   => $request->volume_liters * $request->price_per_liter,
        ]);

        $delivery->statusLogs()->create([
            'changed_by' => $request->user()->id,
            'from_status' => null,
            'to_status' => 'CREATED',
            'notes' => 'Pengiriman dibuat',
        ]);

        return response()->json($delivery->load(['admin', 'driver']), 201);
    }

    public function show(Request $request, Delivery $delivery)
    {
        $user = $request->user();

        if ($user->hasRole('driver') && $delivery->driver_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($delivery->load([
            'admin:id,name', 
            'driver:id,name,phone',
            'locations', 
            'photos.uploader:id,name',
            'proof', 
            'statusLogs.user:id,name'
        ]));
    }

    public function update(Request $request, Delivery $delivery)
    {
        $validated = $request->validate([
            'driver_id'           => 'sometimes|exists:users,id',
            'customer_name'       => 'sometimes|string',
            'customer_phone'      => 'sometimes|string',
            'destination_address' => 'sometimes|string',
            'destination_lat'     => 'sometimes|numeric',
            'destination_lng'     => 'sometimes|numeric',
            'geofence_radius'     => 'sometimes|integer',
            'fuel_type'           => 'sometimes|in:PERTALITE,PERTAMAX,PERTAMAX_TURBO,SOLAR,DEXLITE',
            'volume_liters'       => 'sometimes|numeric',
            'price_per_liter'     => 'sometimes|numeric',
            'notes'               => 'sometimes|nullable|string',  // nullable: terima null/empty
            'scheduled_at'        => 'sometimes|date',
        ]);

        // Hitung ulang total_price jika volume/harga berubah
        if ($request->has('volume_liters') || $request->has('price_per_liter')) {
            $validated['total_price'] = ($validated['volume_liters'] ?? $delivery->volume_liters)
                                      * ($validated['price_per_liter'] ?? $delivery->price_per_liter);
        }

        $delivery->update($validated);
        return response()->json($delivery->fresh()->load(['admin', 'driver']));
    }

    public function destroy(Delivery $delivery)
    {
        if (!in_array($delivery->status, ['CREATED', 'PACKED'])) {
            return response()->json(['message' => 'Tidak dapat menghapus delivery yang sudah dalam perjalanan'], 422);
        }
        $delivery->delete();
        return response()->json(['message' => 'Delivery berhasil dihapus']);
    }

    public function statistics(Request $request)
    {
        $user = $request->user();
        $query = Delivery::query();

        if ($user->hasRole('driver')) {
            $query->where('driver_id', $user->id);
        }

        return response()->json([
            'total'           => $query->count(),
            'today'           => (clone $query)->whereDate('created_at', today())->count(),
            'in_transit'      => (clone $query)->where('status', 'IN_TRANSIT')->count(),
            'completed_today' => (clone $query)->where('status', 'COMPLETED')->whereDate('updated_at', today())->count(),
            'by_status'       => (clone $query)->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'by_fuel'         => (clone $query)->selectRaw('fuel_type, count(*) as count')->groupBy('fuel_type')->pluck('count', 'fuel_type'),
        ]);
    }

    public function publicTrack(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $delivery = Delivery::where('delivery_code', $request->code) 
            ->with(['driver:id,name,phone', 'locations', 'statusLogs.user:id,name'])
            ->firstOrFail();

        return response()->json([
            'delivery_code'      => $delivery->delivery_code,
            'customer_name'      => $delivery->customer_name,
            'status'             => $delivery->status,
            'fuel_type'          => $delivery->fuel_type,
            'volume_liters'      => $delivery->volume_liters,
            'destination_address'=> $delivery->destination_address,
            'destination_lat'    => $delivery->destination_lat,
            'destination_lng'    => $delivery->destination_lng,
            'driver'             => $delivery->driver,
            'latest_location'    => $delivery->latestLocation,
            'status_logs'        => $delivery->statusLogs,
            'scheduled_at'       => $delivery->scheduled_at,
        ]);
    }

    /** Export deliveries ke CSV */
    public function export(Request $request)
    {
        $query = Delivery::with(['driver:id,name', 'admin:id,name', 'rating'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->from,   fn($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to,     fn($q) => $q->whereDate('created_at', '<=', $request->to))
            ->latest()->get();

        $rows = [implode(',', ['Kode','Status','Customer','Telepon','Driver','Admin','BBM','Volume(L)','Harga/L','Total(Rp)','Alamat','Rating','Dibuat'])];

        foreach ($query as $d) {
            $rows[] = implode(',', [
                $d->delivery_code,
                $d->status,
                '"'.str_replace('"','""',$d->customer_name).'"',
                $d->customer_phone,
                '"'.($d->driver?->name ?? '-').'"',
                '"'.($d->admin?->name  ?? '-').'"',
                $d->fuel_type,
                $d->volume_liters,
                $d->price_per_liter,
                $d->total_price,
                '"'.str_replace('"','""',$d->destination_address).'"',
                $d->rating?->rating ?? '-',
                $d->created_at->format('Y-m-d H:i'),
            ]);
        }

        $filename = 'deliveries_'.now()->format('Ymd_His').'.csv';
        return \Illuminate\Support\Facades\Response::make(implode("\n", $rows), 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ]);
    }
}