import React, { useEffect, useRef } from 'react';

export default function DeliveryMap({ delivery, locations = [] }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (mapInstance.current) return;

        const loadLeaflet = () => {
            if (window.L) { initMap(); return; }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.head.appendChild(script);
        };

        const initMap = () => {
            const L = window.L;
            const destLat = delivery?.destination_lat || -6.2088;
            const destLng = delivery?.destination_lng || 106.8456;

            const map = L.map(mapRef.current).setView([destLat, destLng], 14);
            mapInstance.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            const destIcon = L.divIcon({
                html: `<div style="width:32px;height:32px;background:#FF6B35;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(255,107,53,0.5)"></div>`,
                iconSize: [32, 32], iconAnchor: [16, 32],
                className: '',
            });

            L.marker([destLat, destLng], { icon: destIcon })
                .addTo(map)
                .bindPopup('🎯 Tujuan Pengiriman');

            if (delivery?.geofence_radius) {
                L.circle([destLat, destLng], {
                    radius: delivery.geofence_radius,
                    color: '#FF6B35', fillColor: '#FF6B35', fillOpacity: 0.08,
                    weight: 1.5, dashArray: '5,5'
                }).addTo(map);
            }

            if (locations.length > 0) {
                const latlngs = locations.map(l => [l.latitude, l.longitude]);
                L.polyline(latlngs, { color: '#2D7DD2', weight: 3, opacity: 0.8 }).addTo(map);

                const last = locations[locations.length - 1];
                const driverIcon = L.divIcon({
                    html: `<div style="width:36px;height:36px;background:#1B4F8A;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(27,79,138,0.5);font-size:16px">🚚</div>`,
                    iconSize: [36, 36], iconAnchor: [18, 18], className: '',
                });

                L.marker([last.latitude, last.longitude], { icon: driverIcon })
                    .addTo(map)
                    .bindPopup('🚚 Posisi Driver Terkini');

                // Fit bounds
                const bounds = L.latLngBounds([...latlngs, [destLat, destLng]]);
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        };

        loadLeaflet();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [delivery?.id]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 300 }} />;
}