<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryRating extends Model
{
    protected $fillable = ['delivery_id', 'rated_by', 'driver_id', 'rating', 'comment'];

    public function delivery() { return $this->belongsTo(Delivery::class); }
    public function rater()    { return $this->belongsTo(User::class, 'rated_by'); }
    public function driver()   { return $this->belongsTo(User::class, 'driver_id'); }
}
