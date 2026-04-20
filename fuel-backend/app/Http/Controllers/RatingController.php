<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryRating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /** Customer submit rating untuk delivery yang sudah COMPLETED */
    public function store(Request $request, Delivery $delivery)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'sometimes|nullable|string|max:500',
        ]);

        if ($delivery->status !== 'COMPLETED') {
            return response()->json(['message' => 'Rating hanya bisa diberikan setelah pengiriman selesai'], 422);
        }

        if ($delivery->rating) {
            return response()->json(['message' => 'Anda sudah memberikan rating untuk pengiriman ini'], 422);
        }

        $rating = DeliveryRating::create([
            'delivery_id' => $delivery->id,
            'rated_by'    => $request->user()->id,
            'driver_id'   => $delivery->driver_id,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json($rating->load('rater:id,name', 'driver:id,name'), 201);
    }

    /** Get rating untuk satu delivery */
    public function show(Delivery $delivery)
    {
        return response()->json($delivery->rating ?? ['message' => 'Belum ada rating']);
    }

    /** Get statistik rating driver */
    public function driverStats(int $driverId)
    {
        $stats = DeliveryRating::where('driver_id', $driverId)
            ->selectRaw('COUNT(*) as total, AVG(rating) as average, 
                SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END) as star5,
                SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END) as star4,
                SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END) as star3,
                SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END) as star2,
                SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) as star1')
            ->first();

        $recent = DeliveryRating::where('driver_id', $driverId)
            ->with('rater:id,name', 'delivery:id,delivery_code')
            ->latest()->take(5)->get();

        return response()->json([
            'stats'  => $stats,
            'recent' => $recent,
        ]);
    }
}
