/**
 * Utility untuk Geofencing dan Kalkulasi Jarak
 */

/**
 * Menghitung jarak antara dua titik koordinat dalam Meter (Haversine Formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Hasil dalam meter
};

/**
 * Mengecek apakah posisi saat ini berada di dalam radius tujuan (Geofencing)
 * @param {number} currentLat 
 * @param {number} currentLng 
 * @param {number} targetLat 
 * @param {number} targetLng 
 * @param {number} radiusMeter Default 500 meter
 */
export const isWithinTarget = (currentLat, currentLng, targetLat, targetLng, radiusMeter = 500) => {
    if (!currentLat || !currentLng || !targetLat || !targetLng) return false;
    const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
    return distance <= radiusMeter;
};
