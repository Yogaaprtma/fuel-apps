import React, { useEffect, useRef } from 'react';

export default function DeliveryMap({ delivery, locations = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

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
      if (!mapRef.current) return;
      const L = window.L;
      const destLat = parseFloat(delivery?.destination_lat) || -6.2088;
      const destLng = parseFloat(delivery?.destination_lng) || 106.8456;

      // Dark tile layer matching our design
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([destLat, destLng], 14);

      mapInstance.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Destination marker - glowing pin
      const destIcon = L.divIcon({
        html: `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(249,115,22,0.2);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite"></div>
            <div style="position:relative;width:28px;height:28px;background:linear-gradient(135deg,#f97316,#ea6c0a);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 0 20px rgba(249,115,22,0.6)"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        className: '',
      });

      const destMarker = L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup('<div style="background:#0d1424;color:#f0f4f8;border:1px solid rgba(30,45,66,0.8);padding:8px 12px;border-radius:8px;font-size:12px;font-family:Inter,sans-serif">🎯 <strong>Tujuan Pengiriman</strong></div>', {
          className: 'custom-popup',
        });

      // Geofence circle
      if (delivery?.geofence_radius) {
        L.circle([destLat, destLng], {
          radius: delivery.geofence_radius,
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '6, 4',
        }).addTo(map);
      }

      if (locations.length > 0) {
        const latlngs = locations.map(l => [parseFloat(l.latitude), parseFloat(l.longitude)]).filter(([a,b]) => !isNaN(a) && !isNaN(b));

        if (latlngs.length > 0) {
          // Route polyline with glow effect
          L.polyline(latlngs, {
            color: '#f97316',
            weight: 3,
            opacity: 0.8,
          }).addTo(map);

          // Shadow polyline for glow effect
          L.polyline(latlngs, {
            color: '#fb923c',
            weight: 8,
            opacity: 0.15,
          }).addTo(map);

          // Driver icon (last position)
          const last = latlngs[latlngs.length - 1];
          const driverIcon = L.divIcon({
            html: `
              <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(6,182,212,0.2);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite 0.5s"></div>
                <div style="position:relative;width:36px;height:36px;background:linear-gradient(135deg,#06b6d4,#0891b2);border-radius:50%;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(6,182,212,0.6);font-size:17px">🚚</div>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            className: '',
          });

          L.marker(last, { icon: driverIcon })
            .addTo(map)
            .bindPopup('<div style="background:#0d1424;color:#f0f4f8;border:1px solid rgba(30,45,66,0.8);padding:8px 12px;border-radius:8px;font-size:12px;font-family:Inter,sans-serif">🚚 <strong>Posisi Driver Terkini</strong></div>', {
              className: 'custom-popup',
            });

          const bounds = L.latLngBounds([...latlngs, [destLat, destLng]]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [delivery?.id, locations.length]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 280 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}