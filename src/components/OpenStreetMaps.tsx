"use client";

import { useEffect, useRef } from "react";

interface MarkerData {
  lat: number;
  lng: number;
  place: string;
  time: string;
  description: string;
  day: number;
}

export default function GoogleMapComponent({
  markers,
}: {
  markers: MarkerData[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const validMarkers = markers.filter((m) => m.lat !== 0 && m.lng !== 0);
    if (validMarkers.length === 0) return;

    // Dynamically import leaflet only on client
    import("leaflet").then((L) => {
      // @ts-ignore - Fix for leaflet's default icon paths when used with bundlers
      import("leaflet/dist/leaflet.css");

      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Destroy previous map instance if exists (important for Dialog re-renders)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView(
        [validMarkers[0].lat, validMarkers[0].lng],
        12,
      );

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add markers
      validMarkers.forEach((marker, index) => {
        const customIcon = L.divIcon({
          html: `<div style="
            background:hsl(var(--primary));
            color:hsl(var(--primary-foreground));
            border-radius:50%;
            width:28px;
            height:28px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;
            font-size:12px;
            border:2px solid hsl(var(--card));
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
          ">${index + 1}</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(map)
          .bindPopup(`
            <div style="min-width:180px;">
              <strong>Day ${marker.day}: ${marker.place}</strong><br/>
              <span style="color:hsl(var(--muted-foreground));font-size:12px;">${marker.time}</span><br/>
              <p style="margin:4px 0;font-size:13px;">${marker.description}</p>
            </div>
          `);
      });

      // Fit bounds
      if (validMarkers.length > 1) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{ height: "450px", width: "100%" }}
      className="rounded-b-lg z-0"
    />
  );
}
