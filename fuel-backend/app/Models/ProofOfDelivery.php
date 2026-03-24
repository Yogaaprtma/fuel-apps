<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProofOfDelivery extends Model
{
    protected $fillable = [
        'delivery_id', 
        'recipient_name', 
        'signature_path', 
        'photo_path',
        'latitude', 
        'longitude', 
        'distance_from_destination',
        'geofence_valid', 
        'signed_at'
    ];

    protected $casts = [
        'geofence_valid' => 'boolean',
        'signed_at' => 'datetime',
    ];

    protected $appends = [
        'signature_url', 
        'photo_url'
    ];

    public function getSignatureUrlAttribute()
    {
        return $this->signature_path ? asset('storage/' . $this->signature_path) : null;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo_path ? asset('storage/' . $this->photo_path) : null;
    }

    public function delivery() 
    { 
        return $this->belongsTo(Delivery::class); 
    }
}
