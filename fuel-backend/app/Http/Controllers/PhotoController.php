<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function store(Request $request, Delivery $delivery)
    {
        $request->validate([
            'photo'      => 'required|image|max:5120',
            'photo_type' => 'required|in:PICKUP,IN_TRANSIT,DESTINATION,OTHER',
            'latitude'   => 'sometimes|numeric',
            'longitude'  => 'sometimes|numeric',
            'caption'    => 'sometimes|string|max:255',
        ]);

        // Fix B1: Hanya driver yang di-assign ke delivery yang bisa upload foto
        $user = $request->user();
        if ($user->hasRole('driver') && $delivery->driver_id !== $user->id) {
            return response()->json(['message' => 'Forbidden: Anda bukan driver untuk delivery ini'], 403);
        }

        $path = $request->file('photo')->store('delivery-photos', 's3');

        $photo = $delivery->photos()->create([
            'uploaded_by' => $user->id,
            'photo_path'  => $path,
            'photo_type'  => $request->photo_type,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'caption'     => $request->caption,
            'taken_at'    => now(),
        ]);

        return response()->json($photo->load('uploader:id,name'), 201);
    }

    public function destroy(Delivery $delivery, $photoId)
    {
        $user    = request()->user();
        $photo   = $delivery->photos()->findOrFail($photoId);

        // Hanya uploader atau admin yang bisa hapus foto
        if ($user->hasRole('driver') && $photo->uploaded_by !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        \Storage::disk('s3')->delete($photo->photo_path);
        $photo->delete();
        return response()->json(['message' => 'Foto berhasil dihapus']);
    }
}
