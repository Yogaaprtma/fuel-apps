<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryStatusLog extends Model
{
    protected $fillable = [
        'delivery_id',
        'changed_by',
        'from_status',
        'to_status',
        'notes',
        'latitude',
        'longitude'
    ];

    public function delivery() 
    { 
        return $this->belongsTo(Delivery::class); 
    }

    public function user() 
    { 
        return $this->belongsTo(User::class, 'changed_by'); 
    }
}
