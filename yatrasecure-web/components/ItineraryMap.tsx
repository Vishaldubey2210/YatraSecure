'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// ─── Types ─────────────────────────────────────────────────────────────────
type PlacePoint = {
  name: string;
  lat: number;
  lng: number;
  period: 'morning' | 'afternoon' | 'evening' | 'start' | 'end';
  day: number;
  activity: string;
};

type ItineraryDay = {
  day: number;
  morning?:   { place?: string; activity?: string };
  afternoon?: { place?: string; activity?: string };
  evening?:   { place?: string; activity?: string };
};

interface ItineraryMapProps {
  itineraryData: { days: ItineraryDay[] };
  fromCity: string;
  toCity: string;
}

// ─── Period Colors ──────────────────────────────────────────────────────────
const periodColors: Record<string, string> = {
  morning:   '#fbbf24',
  afternoon: '#fb923c',
  evening:   '#818cf8',
  start:     '#22c55e',
  end:       '#f87171',
};

const periodEmoji: Record<string, string> = {
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌙',
  start:     '🏁',
  end:       '🎯',
};

// ─── Custom SVG Marker ───────────────────────────────────────────────────────
function createCustomIcon(color: string, emoji: string, label: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        display:flex; flex-direction:column; align-items:center; cursor:pointer;
      ">
        <div style="
          width:36px; height:36px; border-radius:50% 50% 50% 0;
          transform:rotate(-45deg); background:${color};
          border:3px solid white;
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="transform:rotate(45deg); font-size:14px;">${emoji}</span>
        </div>
        <div style="
          background:rgba(15,23,42,0.95); color:white;
          font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;
          margin-top:2px; white-space:nowrap; max-width:90px;
          overflow:hidden; text-overflow:ellipsis;
          border:1px solid rgba(255,255,255,0.1);
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          letter-spacing:0.02em;
        ">${label}</div>
      </div>
    `,
    iconSize:   [36, 52],
    iconAnchor: [18, 52],
    popupAnchor:[0, -54],
  });
}

// ─── Auto-fit bounds ─────────────────────────────────────────────────────────
function FitBounds({ points }: { points: PlacePoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [points, map]);
  return null;
}

// ─── Geocode via Nominatim ───────────────────────────────────────────────────
async function geocode(place: string, city: string): Promise<[number, number] | null> {
  const queries = [
    `${place}, ${city}, India`,
    `${place}, India`,
    `${city}, India`,
  ];
  for (const q of queries) {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = await res.json();
      if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch { /* try next */ }
  }
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ItineraryMap({
  itineraryData,
  fromCity,
  toCity,
}: ItineraryMapProps) {
  const [points,  setPoints]  = useState<PlacePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded,  setLoaded]  = useState(0);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    if (!itineraryData?.days?.length) { setLoading(false); return; }

    (async () => {
      setLoading(true);

      // Collect all unique places
      type RawPlace = {
        name: string;
        period: PlacePoint['period'];
        day: number;
        activity: string;
      };

      const raw: RawPlace[] = [];

      // Start & End city
      raw.push({ name: fromCity, period: 'start', day: 0,   activity: `Depart from ${fromCity}` });
      raw.push({ name: toCity,   period: 'end',   day: 9999, activity: `Arrive at ${toCity}`    });

      // All day places
      for (const day of itineraryData.days) {
        for (const period of ['morning', 'afternoon', 'evening'] as const) {
          const slot = day[period];
          if (slot?.place?.trim()) {
            raw.push({
              name:     slot.place.trim(),
              period,
              day:      day.day,
              activity: slot.activity || slot.place,
            });
          }
        }
      }

      // Remove duplicates by name
      const unique = raw.filter(
        (r, i, arr) => arr.findIndex((x) => x.name.toLowerCase() === r.name.toLowerCase()) === i,
      );

      setTotal(unique.length);

      // Geocode all
      const results: PlacePoint[] = [];
      for (const u of unique) {
        const coords = await geocode(u.name, toCity);
        setLoaded((p) => p + 1);
        if (coords) {
          results.push({ ...u, lat: coords[0], lng: coords[1] });
        }
      }

      // Sort: start → day 1 morning → ... → end
      results.sort((a, b) => {
        const order = { start: -1, end: 99999 };
        const aOrder = a.period === 'start' ? -1 : a.period === 'end' ? 99999 : a.day * 10 + ['morning', 'afternoon', 'evening'].indexOf(a.period);
        const bOrder = b.period === 'start' ? -1 : b.period === 'end' ? 99999 : b.day * 10 + ['morning', 'afternoon', 'evening'].indexOf(b.period);
        return aOrder - bOrder;
      });

      setPoints(results);
      setLoading(false);
    })();
  }, [itineraryData, fromCity, toCity]);

  // Route polyline positions
  const routePositions: [number, number][] = points.map((p) => [p.lat, p.lng]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      borderRadius: 14, background: 'rgba(15,23,42,0.7)',
      border: '1px solid rgba(148,163,184,0.08)',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🗺️</div>
      <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, margin: '0 0 16px' }}>
        Loading Map…
      </p>
      {total > 0 && (
        <>
          <div style={{ height: 5, background: '#1e293b', borderRadius: 99, overflow: 'hidden', maxWidth: 220, margin: '0 auto 8px' }}>
            <div style={{ height: '100%', width: `${(loaded / total) * 100}%`, background: '#f97316', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <p style={{ color: '#475569', fontSize: 11 }}>Geocoding {loaded}/{total} places…</p>
        </>
      )}
    </div>
  );

  if (points.length === 0) return (
    <div style={{
      borderRadius: 14, background: 'rgba(15,23,42,0.7)',
      border: '1px solid rgba(148,163,184,0.08)',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <p style={{ color: '#64748b', fontSize: 13 }}>🗺️ No places found to plot on map</p>
    </div>
  );

  // ── Map ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div style={{
        padding: '12px 18px', background: 'rgba(15,23,42,0.95)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Trip Route Map</span>
          <span style={{ color: '#64748b', fontSize: 12 }}>{fromCity} → {toCity}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(periodEmoji).map(([period, emoji]) => (
            <div key={period} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: periodColors[period] }} />
              <span style={{ color: '#64748b', fontSize: 11, textTransform: 'capitalize' }}>{emoji} {period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={10}
        style={{ height: 480, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} />

        {/* Route Polyline */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color:     '#f97316',
            weight:    3,
            opacity:   0.85,
            dashArray: '8, 6',
          }}
        />

        {/* Markers */}
        {points.map((pt, i) => (
          <Marker
            key={`${pt.name}-${i}`}
            position={[pt.lat, pt.lng]}
            icon={createCustomIcon(
              periodColors[pt.period] ?? '#94a3b8',
              periodEmoji[pt.period]  ?? '📍',
              pt.name.length > 14 ? pt.name.slice(0, 14) + '…' : pt.name,
            )}
          >
            <Popup>
              <div style={{ minWidth: 160, fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: periodColors[pt.period], flexShrink: 0 }} />
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{pt.name}</strong>
                </div>
                {pt.period !== 'start' && pt.period !== 'end' && (
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#475569' }}>
                    Day {pt.day} • {periodEmoji[pt.period]} {pt.period}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: 12, color: '#0f172a' }}>{pt.activity}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Footer — Stop count */}
      <div style={{
        padding: '8px 18px', background: 'rgba(15,23,42,0.95)',
        borderTop: '1px solid rgba(148,163,184,0.06)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 24, height: 3, background: '#f97316', borderRadius: 2, opacity: 0.8 }} />
        <span style={{ color: '#475569', fontSize: 11 }}>
          {points.length} stops plotted • Dashed line = suggested route order
        </span>
      </div>
    </div>
  );
}
