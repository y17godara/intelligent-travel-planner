"use client";

import React, { useMemo } from "react";
import GoogleMapReact from "google-map-react";
import { MapPin } from "lucide-react";

interface MarkerData {
  lat: number;
  lng: number;
  place: string;
  time: string;
  description: string;
  day: number;
}

const Marker = ({
  place,
  day,
  lat,
  lng,
}: {
  place: string;
  day: number;
  lat?: number;
  lng?: number;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
          {day}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 h-3 w-3 bg-gradient-to-br from-blue-500 to-purple-500 clip-triangle" />
      </div>
      <div className="mt-2 rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-md whitespace-nowrap">
        {place}
      </div>
    </div>
  );
};

interface GoogleMapComponentProps {
  markers: MarkerData[];
  height?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

export default function GoogleMapComponent({
  markers,
  height = "500px",
  defaultZoom = 12,
}: GoogleMapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Calculate center from markers
  const defaultCenter = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 20, lng: 0 };
    }

    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;

    return { lat: avgLat, lng: avgLng };
  }, [markers]);

  // Calculate zoom based on marker spread
  const calculateZoom = useMemo(() => {
    if (markers.length < 2) return 12;

    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread < 0.1) return 15;
    if (maxSpread < 0.5) return 13;
    if (maxSpread < 2) return 11;
    return 9;
  }, [markers]);

  return (
    <div style={{ height, width: "100%" }}>
      {apiKey ? (
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={defaultCenter}
          defaultZoom={calculateZoom}
          yesIWantToUseGoogleMapApiInternals
        >
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              lat={marker.lat}
              lng={marker.lng}
              place={marker.place}
              day={marker.day}
            />
          ))}
        </GoogleMapReact>
      ) : (
        <div className="flex h-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 font-semibold">
              Google Maps API key not configured
            </p>
            <p className="text-sm text-gray-500">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
