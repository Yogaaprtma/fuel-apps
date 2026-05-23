<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RouteOptimizationService
{
    /**
     * Menggunakan OSRM Public API (Trip) untuk optimasi rute
     * $locations = [ ['lat' => -6.200000, 'lng' => 106.816666], ... ]
     */
    public function optimizeRoute(array $locations)
    {
        if (count($locations) < 2) {
            return [
                'success' => false,
                'message' => 'Minimal 2 titik lokasi diperlukan untuk optimasi rute.',
            ];
        }

        // OSRM format: lng,lat;lng,lat
        $coordinates = implode(';', array_map(function ($loc) {
            return $loc['lng'] . ',' . $loc['lat'];
        }, $locations));

        try {
            $response = Http::timeout(10)->get("http://router.project-osrm.org/trip/v1/driving/{$coordinates}", [
                'roundtrip' => 'false',
                'source'    => 'first', // Titik awal (misal: gudang/posisi driver)
                'overview'  => 'full',
                'geometries'=> 'geojson'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['code'] === 'Ok') {
                    return [
                        'success'   => true,
                        'distance'  => $data['trips'][0]['distance'], // dalam meter
                        'duration'  => $data['trips'][0]['duration'], // dalam detik
                        'geometry'  => $data['trips'][0]['geometry'], // GeoJSON untuk digambar di peta
                        'waypoints' => $data['waypoints'] // Urutan optimal
                    ];
                }
            }

            return [
                'success' => false,
                'message' => 'Gagal mendapatkan rute dari OSRM.',
                'error'   => $response->body()
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memanggil OSRM API.',
                'error'   => $e->getMessage()
            ];
        }
    }
}
