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

        $path = $request->file('photo')->store('delivery-photos', 'public');

        $photo = $delivery->photos()->create([
            'uploaded_by' => $request->user()->id,
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
        $photo = $delivery->photos()->findOrFail($photoId);
        \Storage::disk('public')->delete($photo->photo_path);
        $photo->delete();
        return response()->json(['message' => 'Foto berhasil dihapus']);
    }
}
