<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use function Symfony\Component\Clock\now;

class Delivery extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'delivery_code', 
        'admin_id', 
        'driver_id', 
        'customer_id',
        'customer_name', 
        'customer_phone', 
        'destination_address',
        'destination_lat', 
        'destination_lng', 
        'geofence_radius',
        'fuel_type', 
        'volume_liters', 
        'price_per_liter', 
        'total_price',
        'status', 
        'notes', 
        'scheduled_at'
    ];

    protected $casts = [
        'destination_lat' => 'float',
        'destination_lng' => 'float',
        'volume_liters' => 'float',
        'price_per_liter' => 'float',
        'total_price' => 'float',
        'scheduled_at' => 'datetime',
    ];

    const STATUS_FLOW = [
        'CREATED'          => 'PACKED',
        'PACKED'           => 'IN_TRANSIT',
        'IN_TRANSIT'       => 'NEAR_DESTINATION',
        'NEAR_DESTINATION' => 'DELIVERED',
        'DELIVERED'        => 'COMPLETED',
        'COMPLETED'        => null,
    ];

    public function canTransitionTo(string $newStatus): bool
    {
        return self::STATUS_FLOW[$this->status] === $newStatus;
    }

    // Hitung jarak menggunakan Haversine formula
    public function calculateDistance(float $lat, float $lng): float
    {
        $earthRadius = 6371000;
        $latDiff = deg2rad($lat - $this->destination_lat);
        $lngDiff = deg2rad($lng - $this->destination_lng);
        $a = sin($latDiff / 2) ** 2 +
            cos(deg2rad($this->destination_lat)) *
            cos(deg2rad($lat)) *
            sin($lngDiff / 2) ** 2;
        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public function isWithinGeofence(float $lat, float $lng): bool
    {
        return $this->calculateDistance($lat, $lng) <= $this->geofence_radius;
    }

    public static function generateCode(): string
    {
        $date = now()->format('Ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return 'FDS-' . $date . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }

    public function admin() 
    { 
        return $this->belongsTo(User::class, 'admin_id'); 
    }

    public function driver() 
    { 
        return $this->belongsTo(User::class, 'driver_id'); 
    }

    public function customer() 
    { 
        return $this->belongsTo(User::class, 'customer_id');     
    }

    public function locations() 
    { 
        return $this->hasMany(DeliveryLocation::class)->orderBy('recorded_at'); 
    }

    public function latestLocation() 
    { 
        return $this->hasOne(DeliveryLocation::class)->latestOfMany('recorded_at'); 
    }

    public function photos() 
    { 
        return $this->hasMany(DeliveryPhoto::class); 
    }

    public function proof() 
    { 
        return $this->hasOne(ProofOfDelivery::class); 
    }

    public function statusLogs() 
    { 
        return $this->hasMany(DeliveryStatusLog::class)->orderBy('created_at'); 
    }
}
