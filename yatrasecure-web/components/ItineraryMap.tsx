'use client';

import { useEffect, useState, useMemo } from 'react';
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
  period: 'morning' | 'afternoon' | 'evening' | 'start' | 'end' | 'stay';
  day: number;
  activity: string;
  cost?: number;
  safetyTip?: string;
  travelTime?: string;
  placeType?: 'stay' | 'attraction' | 'food' | 'transport';
  isBestExperience?: boolean;
};

type ItinerarySlot = {
  place?: string;
  activity?: string;
  cost?: number;
  tip?: string;
  travelTime?: string;
  lat?: number;
  lng?: number;
  type?: string;
};

type ItineraryDay = {
  day: number;
  title?: string;
  bestExperience?: string;
  morning?: ItinerarySlot;
  afternoon?: ItinerarySlot;
  evening?: ItinerarySlot;
  stay?: { name?: string; cost?: number; lat?: number; lng?: number };
  transport?: string;
  transportMode?: string;
  safetyTips?: string[];
  estimated_daily_cost?: number;
};

type MapDataType = {
  center?: { lat: number; lng: number };
  zoom?: number;
};

interface ItineraryMapProps {
  itineraryData: {
    days: ItineraryDay[];
    mapData?: MapDataType;
    warnings?: string[];
    budgetTier?: string;
  };
  fromCity: string;
  toCity: string;
}

// ─── Period Colors ──────────────────────────────────────────────────────────
const periodColors: Record<string, string> = {
  morning:   '#fbbf24',
  afternoon: '#fb923c',
  evening:   '#818cf8',
  stay:      '#10b981',
  start:     '#22c55e',
  end:       '#f87171',
};

const periodEmoji: Record<string, string> = {
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌙',
  stay:      '🏨',
  start:     '🏁',
  end:       '🎯',
};

// ─── Place Type Styling ─────────────────────────────────────────────────────
const placeTypeConfig: Record<string, { emoji: string; color: string }> = {
  stay:       { emoji: '🏨', color: '#10b981' },
  attraction: { emoji: '📍', color: '#8b5cf6' },
  food:       { emoji: '🍽️', color: '#f97316' },
  transport:  { emoji: '🚉', color: '#3b82f6' },
};

// ─── Transport Mode Colors ──────────────────────────────────────────────────
const transportModeColors: Record<string, { color: string; dash: string; label: string }> = {
  flight: { color: '#3b82f6', dash: '12, 8', label: '✈️ Flight' },
  train:  { color: '#22c55e', dash: '',      label: '🚆 Train' },
  bus:    { color: '#f97316', dash: '',      label: '🚌 Bus' },
  taxi:   { color: '#a855f7', dash: '6, 4',  label: '🚕 Taxi' },
  auto:   { color: '#eab308', dash: '4, 4',  label: '🛺 Auto' },
  walk:   { color: 'var(--text2)', dash: '2, 4',  label: '🚶 Walk' },
};

// ─── Day Colors (for day-wise toggling) ─────────────────────────────────────
const dayColors = [
  '#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444',
  '#eab308', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16',
];

// ─── Custom SVG Marker ───────────────────────────────────────────────────────
function createCustomIcon(
  color: string,
  emoji: string,
  label: string,
  isBest = false,
  dayNum?: number,
) {
  const glowStyle = isBest ? `box-shadow:0 0 16px 4px rgba(234,179,8,0.6);` : '';
  const bestBadge = isBest ? `<div style="position:absolute;top:-8px;right:-8px;font-size:12px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">⭐</div>` : '';
  const dayBadge = dayNum != null ? `<div style="position:absolute;top:-6px;left:-6px;width:16px;height:16px;border-radius:50%;background:#0f172a;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;color:${color};">${dayNum}</div>` : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer; position:relative;">
        ${bestBadge}
        ${dayBadge}
        <div style="
          width:38px; height:38px; border-radius:50% 50% 50% 0;
          transform:rotate(-45deg); background:${color};
          border:3px solid white;
          ${glowStyle}
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
          display:flex; align-items:center; justify-content:center;
        ">
          <span style="transform:rotate(45deg); font-size:15px;">${emoji}</span>
        </div>
        <div style="
          background:rgba(15,23,42,0.95); color:white;
          font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;
          margin-top:2px; white-space:nowrap; max-width:100px;
          overflow:hidden; text-overflow:ellipsis;
          border:1px solid rgba(255,255,255,0.15);
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          letter-spacing:0.02em;
        ">${label}</div>
      </div>
    `,
    iconSize:   [38, 56],
    iconAnchor: [19, 56],
    popupAnchor:[0, -58],
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

// ─── Geocode via Nominatim (fallback when AI doesn't provide coords) ────────
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

  // Day filter: null = all days
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const allDays = useMemo(() => {
    if (!itineraryData?.days) return [];
    return [...new Set(itineraryData.days.map(d => d.day))].sort((a, b) => a - b);
  }, [itineraryData]);

  useEffect(() => {
    if (!itineraryData?.days?.length) { setLoading(false); return; }

    (async () => {
      setLoading(true);

      type RawPlace = {
        name: string;
        period: PlacePoint['period'];
        day: number;
        activity: string;
        cost?: number;
        safetyTip?: string;
        travelTime?: string;
        placeType?: 'stay' | 'attraction' | 'food' | 'transport';
        isBestExperience?: boolean;
        lat?: number;
        lng?: number;
      };

      const raw: RawPlace[] = [];

      // Start & End city
      raw.push({ name: fromCity, period: 'start', day: 0, activity: `Depart from ${fromCity}` });
      raw.push({ name: toCity,   period: 'end',   day: 9999, activity: `Arrive at ${toCity}` });

      // All day places
      for (const day of itineraryData.days) {
        const bestExp = day.bestExperience?.toLowerCase() || '';

        for (const period of ['morning', 'afternoon', 'evening'] as const) {
          const slot = day[period] as ItinerarySlot | undefined;
          if (slot?.place?.trim()) {
            const isBest = bestExp && slot.activity?.toLowerCase().includes(bestExp.toLowerCase().slice(0, 20));
            raw.push({
              name:     slot.place.trim(),
              period,
              day:      day.day,
              activity: slot.activity || slot.place,
              cost:     slot.cost,
              travelTime: slot.travelTime,
              placeType: (slot.type as any) || 'attraction',
              isBestExperience: !!isBest,
              lat: slot.lat && slot.lat !== 0 ? slot.lat : undefined,
              lng: slot.lng && slot.lng !== 0 ? slot.lng : undefined,
            });
          }
        }

        // Stay/hotel marker
        if (day.stay?.name?.trim()) {
          raw.push({
            name: day.stay.name.trim(),
            period: 'stay',
            day: day.day,
            activity: `Stay: ${day.stay.name}`,
            cost: day.stay.cost,
            placeType: 'stay',
            lat: day.stay.lat && day.stay.lat !== 0 ? day.stay.lat : undefined,
            lng: day.stay.lng && day.stay.lng !== 0 ? day.stay.lng : undefined,
          });
        }
      }

      // Remove exact duplicates by name
      const unique = raw.filter(
        (r, i, arr) => arr.findIndex((x) => x.name.toLowerCase() === r.name.toLowerCase()) === i,
      );

      setTotal(unique.length);

      // Resolve coordinates (prefer AI-provided, fallback to geocoding)
      const results: PlacePoint[] = [];
      for (const u of unique) {
        let lat = u.lat;
        let lng = u.lng;

        if (!lat || !lng) {
          const coords = await geocode(u.name, toCity);
          setLoaded((p) => p + 1);
          if (coords) {
            lat = coords[0];
            lng = coords[1];
          }
        } else {
          setLoaded((p) => p + 1);
        }

        if (lat && lng) {
          results.push({
            name: u.name,
            lat,
            lng,
            period: u.period,
            day: u.day,
            activity: u.activity,
            cost: u.cost,
            safetyTip: u.safetyTip,
            travelTime: u.travelTime,
            placeType: u.placeType,
            isBestExperience: u.isBestExperience,
          });
        }
      }

      // Sort: start → day 1 morning → ... → end
      results.sort((a, b) => {
        const aOrder = a.period === 'start' ? -1 : a.period === 'end' ? 99999 : a.day * 10 + ['morning', 'afternoon', 'evening', 'stay'].indexOf(a.period);
        const bOrder = b.period === 'start' ? -1 : b.period === 'end' ? 99999 : b.day * 10 + ['morning', 'afternoon', 'evening', 'stay'].indexOf(b.period);
        return aOrder - bOrder;
      });

      setPoints(results);
      setLoading(false);
    })();
  }, [itineraryData, fromCity, toCity]);

  // Filter points by active day
  const filteredPoints = useMemo(() => {
    if (activeDay === null) return points;
    return points.filter(p => p.day === activeDay || p.period === 'start' || p.period === 'end');
  }, [points, activeDay]);

  // Route polyline positions — grouped by day for coloring
  const routeSegments = useMemo(() => {
    const segments: { positions: [number, number][]; color: string; dash: string; dayNum: number }[] = [];

    if (activeDay !== null) {
      // Single day mode
      const dayPoints = filteredPoints;
      if (dayPoints.length > 1) {
        const positions = dayPoints.map(p => [p.lat, p.lng] as [number, number]);
        const dayIdx = allDays.indexOf(activeDay);
        segments.push({
          positions,
          color: dayColors[dayIdx % dayColors.length],
          dash: '8, 6',
          dayNum: activeDay,
        });
      }
    } else {
      // All days mode — segment by day
      const dayGroups = new Map<number, PlacePoint[]>();
      points.forEach(p => {
        const d = p.day;
        if (!dayGroups.has(d)) dayGroups.set(d, []);
        dayGroups.get(d)!.push(p);
      });

      dayGroups.forEach((pts, dayNum) => {
        if (pts.length < 2) return;
        const positions = pts.map(p => [p.lat, p.lng] as [number, number]);
        const dayIdx = allDays.indexOf(dayNum);

        // Try to use transport mode color
        const dayData = itineraryData?.days?.find(d => d.day === dayNum);
        const mode = dayData?.transportMode?.toLowerCase() || '';
        const modeConfig = transportModeColors[mode];

        segments.push({
          positions,
          color: modeConfig?.color || dayColors[dayIdx % dayColors.length],
          dash: modeConfig?.dash || '8, 6',
          dayNum,
        });
      });

      // Connect day endings to next day starts
      const sortedDays = Array.from(dayGroups.keys()).sort((a, b) => a - b).filter(d => d > 0 && d < 9999);
      for (let i = 0; i < sortedDays.length - 1; i++) {
        const currPts = dayGroups.get(sortedDays[i]);
        const nextPts = dayGroups.get(sortedDays[i + 1]);
        if (currPts?.length && nextPts?.length) {
          const last = currPts[currPts.length - 1];
          const first = nextPts[0];
          segments.push({
            positions: [[last.lat, last.lng], [first.lat, first.lng]],
            color: 'rgba(148,163,184,0.4)',
            dash: '4, 8',
            dayNum: -1,
          });
        }
      }
    }

    return segments;
  }, [points, filteredPoints, activeDay, allDays, itineraryData]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      borderRadius: 14, background: 'var(--bg)',
      border: '1px solid rgba(148,163,184,0.08)',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🗺️</div>
      <p style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600, margin: '0 0 16px' }}>
        Loading Map…
      </p>
      {total > 0 && (
        <>
          <div style={{ height: 5, background: 'var(--card)', borderRadius: 99, overflow: 'hidden', maxWidth: 220, margin: '0 auto 8px' }}>
            <div style={{ height: '100%', width: `${(loaded / total) * 100}%`, background: 'linear-gradient(90deg, #f97316, #fbbf24)', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <p style={{ color: '#475569', fontSize: 11 }}>Plotting {loaded}/{total} locations…</p>
        </>
      )}
    </div>
  );

  if (points.length === 0) return (
    <div style={{
      borderRadius: 14, background: 'var(--bg)',
      border: '1px solid rgba(148,163,184,0.08)',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>🗺️ No places found to plot on map</p>
    </div>
  );

  // Determine map center
  const mapCenter: [number, number] = itineraryData?.mapData?.center
    ? [itineraryData.mapData.center.lat, itineraryData.mapData.center.lng]
    : [filteredPoints[0].lat, filteredPoints[0].lng];

  const mapZoom = itineraryData?.mapData?.zoom || 10;

  // ── Map ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div style={{
        padding: '12px 18px', background: 'var(--bg)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 700 }}>Smart Route Map</span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>{fromCity} → {toCity}</span>
          {itineraryData?.budgetTier && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: itineraryData.budgetTier === 'Luxury' ? 'rgba(234,179,8,0.15)' : itineraryData.budgetTier === 'Budget' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
              color: itineraryData.budgetTier === 'Luxury' ? '#fbbf24' : itineraryData.budgetTier === 'Budget' ? '#22c55e' : '#60a5fa',
              border: `1px solid ${itineraryData.budgetTier === 'Luxury' ? 'rgba(234,179,8,0.3)' : itineraryData.budgetTier === 'Budget' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
            }}>
              {itineraryData.budgetTier === 'Luxury' ? '✨' : itineraryData.budgetTier === 'Budget' ? '💰' : '🎯'} {itineraryData.budgetTier}
            </span>
          )}
        </div>
      </div>

      {/* Day Toggle Bar */}
      {allDays.filter(d => d > 0 && d < 9999).length > 1 && (
        <div style={{
          padding: '8px 18px', background: 'var(--bg)',
          borderBottom: '1px solid rgba(148,163,184,0.06)',
          display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto',
        }}>
          <button
            onClick={() => setActiveDay(null)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: activeDay === null ? 'rgba(255,255,255,0.15)' : 'var(--border)',
              color: activeDay === null ? 'var(--text)' : 'var(--text3)',
            }}
          >
            All Days
          </button>
          {allDays.filter(d => d > 0 && d < 9999).map((d, idx) => (
            <button
              key={d}
              onClick={() => setActiveDay(activeDay === d ? null : d)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: activeDay === d ? dayColors[idx % dayColors.length] : 'var(--border)',
                color: activeDay === d ? 'var(--text)' : 'var(--text3)',
              }}
            >
              Day {d}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{
        padding: '6px 18px', background: 'var(--bg)',
        borderBottom: '1px solid rgba(148,163,184,0.04)',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {Object.entries(placeTypeConfig).map(([type, { emoji, color }]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ color: 'var(--text3)', fontSize: 10, textTransform: 'capitalize' }}>{emoji} {type}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
        {Object.entries(periodEmoji).filter(([k]) => !['start', 'end', 'stay'].includes(k)).map(([period, emoji]) => (
          <div key={period} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: periodColors[period] }} />
            <span style={{ color: 'var(--text3)', fontSize: 10, textTransform: 'capitalize' }}>{emoji} {period}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: 520, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <FitBounds points={filteredPoints} />

        {/* Route Polylines — day-colored */}
        {routeSegments.map((seg, i) => (
          <Polyline
            key={`route-${i}`}
            positions={seg.positions}
            pathOptions={{
              color:     seg.color,
              weight:    seg.dayNum === -1 ? 2 : 3,
              opacity:   seg.dayNum === -1 ? 0.3 : 0.85,
              dashArray: seg.dash || undefined,
            }}
          />
        ))}

        {/* Markers */}
        {filteredPoints.map((pt, i) => {
          const typeConfig = placeTypeConfig[pt.placeType || 'attraction'] || placeTypeConfig.attraction;
          const markerColor = pt.period === 'start' || pt.period === 'end'
            ? periodColors[pt.period]
            : pt.isBestExperience
              ? '#eab308'
              : typeConfig.color;
          const markerEmoji = pt.period === 'start' || pt.period === 'end'
            ? periodEmoji[pt.period]
            : pt.isBestExperience
              ? '⭐'
              : typeConfig.emoji;

          return (
            <Marker
              key={`${pt.name}-${i}`}
              position={[pt.lat, pt.lng]}
              icon={createCustomIcon(
                markerColor,
                markerEmoji,
                pt.name.length > 16 ? pt.name.slice(0, 16) + '…' : pt.name,
                pt.isBestExperience,
                pt.day > 0 && pt.day < 9999 ? pt.day : undefined,
              )}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: 'inherit', padding: '4px 0' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: `${markerColor}20`,
                      border: `1px solid ${markerColor}40`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 14,
                    }}>
                      {markerEmoji}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--bg)', display: 'block' }}>{pt.name}</strong>
                      {pt.period !== 'start' && pt.period !== 'end' && (
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          Day {pt.day} • {periodEmoji[pt.period]} {pt.period}
                        </span>
                      )}
                    </div>
                    {pt.isBestExperience && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, background: 'rgba(234,179,8,0.15)',
                        color: '#eab308', padding: '2px 6px', borderRadius: 10,
                        border: '1px solid rgba(234,179,8,0.3)', marginLeft: 'auto',
                      }}>⭐ Best</span>
                    )}
                  </div>

                  {/* Activity */}
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--border)', lineHeight: 1.5 }}>
                    {pt.activity}
                  </p>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    {pt.cost != null && pt.cost > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        ₹{pt.cost}
                      </span>
                    )}
                    {pt.travelTime && (
                      <span style={{ fontSize: 11, color: 'var(--text3)', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                        🕐 {pt.travelTime}
                      </span>
                    )}
                    {pt.placeType && (
                      <span style={{ fontSize: 10, color: 'var(--text2)', background: '#f8fafc', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>
                        {placeTypeConfig[pt.placeType]?.emoji} {pt.placeType}
                      </span>
                    )}
                  </div>

                  {/* Safety tip */}
                  {pt.safetyTip && (
                    <div style={{
                      padding: '6px 8px', background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.1)', borderRadius: 6,
                      fontSize: 11, color: '#ef4444', marginTop: 4,
                    }}>
                      🛡️ {pt.safetyTip}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>

      {/* Footer — Stats */}
      <div style={{
        padding: '8px 18px', background: 'var(--bg)',
        borderTop: '1px solid rgba(148,163,184,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 3, background: 'linear-gradient(90deg, #f97316, #3b82f6, #10b981)', borderRadius: 2, opacity: 0.8 }} />
          <span style={{ color: '#475569', fontSize: 11 }}>
            {filteredPoints.length} stops plotted
            {activeDay !== null ? ` (Day ${activeDay})` : ` across ${allDays.filter(d => d > 0 && d < 9999).length} days`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeDay === null && Object.entries(transportModeColors).slice(0, 4).map(([mode, { color, label }]) => (
            <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
              <span style={{ color: '#475569', fontSize: 10 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
