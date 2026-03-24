<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryPhoto extends Model
{
    protected $fillable = [
        'delivery_id', 
        'uploaded_by', 
        'photo_path',
        'photo_type', 
        'latitude', 
        'longitude', 
        'caption', 
        'taken_at'
    ];

    protected $casts = [
        'taken_at' => 'datetime'
    ];

    protected $appends = [
        'photo_url'
    ];

    public function getPhotoUrlAttribute()
    {
        return asset('storage/' . $this->photo_path);
    }

    public function delivery() 
    { 
        return $this->belongsTo(Delivery::class); 
    }

    public function uploader() 
    { 
        return $this->belongsTo(User::class, 'uploaded_by'); 
    }
}
