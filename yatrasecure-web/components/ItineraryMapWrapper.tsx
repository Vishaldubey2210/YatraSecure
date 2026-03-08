'use client';

import dynamic from 'next/dynamic';

const ItineraryMap = dynamic(
  () => import('./ItineraryMap'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        borderRadius: 14, background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(148,163,184,0.08)',
        height: 200, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#475569', fontSize: 13,
        gap: 8,
      }}>
        🗺️ Loading map…
      </div>
    ),
  },
);

export default ItineraryMap;
