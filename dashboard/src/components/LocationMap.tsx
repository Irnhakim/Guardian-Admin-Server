"use client";

import { useEffect, useRef } from "react";

interface LocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export default function LocationMap({ lat, lng, zoom = 15 }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Lazy load Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([lat, lng], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapInstance.current);

        markerRef.current = L.marker([lat, lng])
          .addTo(mapInstance.current)
          .bindPopup(`<strong>Current Location</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } else {
        // Update existing marker
        mapInstance.current.setView([lat, lng], zoom);
        markerRef.current?.setLatLng([lat, lng]);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
      />
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", borderRadius: "12px" }}
      />
    </>
  );
}
