"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapComponent({ destination, route }: { destination: string; route: string }) {
  // Mock coordinates for visual representation
  // In a real app, we would use a geocoding API based on the route prop
  const startPos: [number, number] = [28.6139, 77.2090]; // Delhi
  const endPos: [number, number] = [15.2993, 74.1240]; // Goa
  
  // If destination implies something else, we just randomly adjust
  // But for mock, we'll just show a line between two points in India
  
  const center: [number, number] = [
    (startPos[0] + endPos[0]) / 2,
    (startPos[1] + endPos[1]) / 2
  ];

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden", zIndex: 0 }}>
      <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={startPos}>
          <Popup>Start: {route.split("→")[0]?.trim() || "Start"}</Popup>
        </Marker>
        <Marker position={endPos}>
          <Popup>Destination: {destination}</Popup>
        </Marker>
        <Polyline positions={[startPos, endPos]} color="var(--primary)" weight={4} dashArray="10, 10" />
      </MapContainer>
    </div>
  );
}
