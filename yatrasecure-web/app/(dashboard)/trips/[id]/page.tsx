'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Calendar, MapPin, Users, Wallet,
  MessageCircle, Settings, Pencil, Trash2, UserPlus,
  LogOut, Loader2, Clock, Shield, Eye, EyeOff,
  ChevronRight, CheckCircle, XCircle, Send, Sparkles,
  Save, X, Map,
} from 'lucide-react';
import { API_BASE_URL, getAccessToken } from '@/app/lib/api';

// Dynamic import for map (SSR fix)
const ItineraryMapWrapper = dynamic(
  () => import('@/components/ItineraryMapWrapper'),
  { ssr: false, loading: () => (
    <div style={{ borderRadius: 14, background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.08)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13, gap: 8 }}>
      🗺️ Loading map…
    </div>
  )},
);

// ─── Types ────────────────────────────────────────────────────────────────────
type ItinerarySlot  = { activity: string; place: string; tip: string; cost: number };
type ItineraryDay   = {
  day: number; date: string; title: string;
  morning: ItinerarySlot; afternoon: ItinerarySlot; evening: ItinerarySlot;
  meals: { breakfast: string; lunch: string; dinner: string };
  transport: string; safety_tip: string; estimated_daily_cost: number;
};
type ItineraryData  = {
  summary: string;
  totalBudgetBreakdown: Record<string, number>;
  days: ItineraryDay[];
  general_tips: string[];
  emergency_contacts: Record<string, string>;
};

const defaultSlot: ItinerarySlot = { activity: '–', place: '', tip: '', cost: 0 };
const periodMeta: Record<string, { icon: string; color: string }> = {
  morning:   { icon: '🌅', color: '#fbbf24' },
  afternoon: { icon: '☀️', color: '#fb923c' },
  evening:   { icon: '🌙', color: '#818cf8' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  borderRadius: 14, background: '#111827',
  border: '1px solid rgba(148,163,184,0.08)', padding: 24,
};
const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 12px', borderRadius: 20, fontSize: 12,
  fontWeight: 600, color, background: bg,
});
const btn = (bg: string, color = 'white'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 18px', borderRadius: 10, fontSize: 13,
  fontWeight: 600, color, background: bg,
  border: 'none', cursor: 'pointer', textDecoration: 'none',
  transition: 'all 0.15s',
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function TripDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const tripId  = params.id as string;

  // core
  const [trip,        setTrip]        = useState<any>(null);
  const [members,     setMembers]     = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [joinMsg,     setJoinMsg]     = useState('');
  const [joining,     setJoining]     = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [leaving,     setLeaving]     = useState(false);
  const [joinRequests,setJoinRequests]= useState<any[]>([]);

  // itinerary
  const [itinerary,        setItinerary]        = useState('');
  const [itineraryData,    setItineraryData]    = useState<ItineraryData | null>(null);
  const [generatingAI,     setGeneratingAI]     = useState(false);
  const [savingItinerary,  setSavingItinerary]  = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [editedItinerary,  setEditedItinerary]  = useState('');
  const [itineraryError,   setItineraryError]   = useState('');
  const [customPrompt,     setCustomPrompt]     = useState('');
  const [showPromptBox,    setShowPromptBox]    = useState(false);
  const [showItinerary,    setShowItinerary]    = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) setCurrentUser(JSON.parse(s));
    loadTrip();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // ── Parse itinerary safely ─────────────────────────────────────────────────
  function parseItinerary(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.days) {
        const safe: ItineraryData = {
          summary:              parsed.summary || 'Trip itinerary',
          totalBudgetBreakdown: (parsed.totalBudgetBreakdown && typeof parsed.totalBudgetBreakdown === 'object') ? parsed.totalBudgetBreakdown : {},
          days: (Array.isArray(parsed.days) ? parsed.days : []).map((d: any) => ({
            day:      d.day  || 0,
            date:     d.date || '',
            title:    d.title || `Day ${d.day}`,
            morning:   (d.morning   && typeof d.morning   === 'object') ? d.morning   : defaultSlot,
            afternoon: (d.afternoon && typeof d.afternoon === 'object') ? d.afternoon : defaultSlot,
            evening:   (d.evening   && typeof d.evening   === 'object') ? d.evening   : defaultSlot,
            meals: (d.meals && typeof d.meals === 'object') ? d.meals : { breakfast: '–', lunch: '–', dinner: '–' },
            transport:            d.transport   || '–',
            safety_tip:           d.safety_tip  || '–',
            estimated_daily_cost: d.estimated_daily_cost || 0,
          })),
          general_tips:       Array.isArray(parsed.general_tips) ? parsed.general_tips : [],
          emergency_contacts: (parsed.emergency_contacts && typeof parsed.emergency_contacts === 'object') ? parsed.emergency_contacts : {},
        };
        setItineraryData(safe);
      } else {
        setItineraryData(null);
      }
    } catch {
      setItineraryData(null);
    }
  }

  // ── Load Trip ──────────────────────────────────────────────────────────────
  async function loadTrip() {
    setLoading(true);
    try {
      const token   = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, { headers });
      if (!res.ok) throw new Error('Trip not found');
      const data = await res.json();
      setTrip(data);

      // Load saved itinerary from DB
      if (data.itinerary) {
        setItinerary(data.itinerary);
        parseItinerary(data.itinerary);
      }

      try {
        const mRes = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, { headers });
        if (mRes.ok) setMembers(await mRes.json());
      } catch { /* ignore */ }

      if (token) {
        try {
          const jRes = await fetch(`${API_BASE_URL}/trips/${tripId}/join-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (jRes.ok) setJoinRequests(await jRes.json());
        } catch { /* ignore */ }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load trip');
      router.push('/trips');
    } finally {
      setLoading(false);
    }
  }

  // ── Generate Itinerary ─────────────────────────────────────────────────────
  async function handleGenerateItinerary() {
    setGeneratingAI(true);
    setItineraryError('');
    setShowPromptBox(false);
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customPrompt: customPrompt.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Generation failed');
      setItinerary(data.itinerary);
      parseItinerary(data.itinerary);
      setTrip((p: any) => p ? { ...p, itinerary: data.itinerary } : p);
      setCustomPrompt('');
      toast.success('Itinerary generated & saved!');
    } catch (e: any) {
      setItineraryError(e.message || 'Failed to generate itinerary');
      toast.error(e.message || 'Failed to generate itinerary');
    } finally {
      setGeneratingAI(false);
    }
  }

  // ── Save Edited Itinerary to DB ────────────────────────────────────────────
  async function handleSaveItinerary() {
    setSavingItinerary(true);
    setItineraryError('');
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itinerary: editedItinerary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setItinerary(editedItinerary);
      parseItinerary(editedItinerary);
      setTrip((p: any) => p ? { ...p, itinerary: editedItinerary } : p);
      setEditingItinerary(false);
      toast.success('Itinerary saved to DB!');
    } catch (e: any) {
      setItineraryError(e.message || 'Failed to save');
      toast.error(e.message || 'Failed to save');
    } finally {
      setSavingItinerary(false);
    }
  }

  // ── Trip actions ───────────────────────────────────────────────────────────
  async function handleJoin() {
    setJoining(true);
    try {
      const token = getAccessToken();
      if (!token) { router.push('/login'); return; }
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/join-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: joinMsg || undefined }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Failed'); }
      toast.success('Join request sent!');
      setJoinMsg('');
      loadTrip();
    } catch (e: any) { toast.error(e.message); }
    finally { setJoining(false); }
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this trip?')) return;
    setLeaving(true);
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}/members/leave`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to leave');
      toast.success('Left the trip');
      loadTrip();
    } catch (e: any) { toast.error(e.message); }
    finally { setLeaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to DELETE this trip? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Trip deleted');
      router.push('/trips');
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleting(false); }
  }

  async function handleRequest(requestId: string, status: 'accepted' | 'rejected') {
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(status === 'accepted' ? 'Member approved!' : 'Request rejected');
      loadTrip();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Remove this member?')) return;
    try {
      const token = getAccessToken();
      const res   = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${userId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Member removed');
      loadTrip();
    } catch (e: any) { toast.error(e.message); }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const isAdmin = !!currentUser && !!trip &&
    (trip.adminId === currentUser.id || trip.admin?.id === currentUser.id);
  const isMember = !!currentUser && members.some(
    (m: any) => m.userId === currentUser.id || m.user?.id === currentUser.id,
  );
  const hasPendingRequest = !!currentUser && joinRequests.some(
    (r: any) => r.userId === currentUser.id && r.status === 'pending',
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #1E293B', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 12 }}>Loading trip...</p>
      </div>
    </div>
  );

  if (!trip) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ color: '#EF4444' }}>Trip not found</p>
    </div>
  );

  const startDate = new Date(trip.startDate);
  const endDate   = new Date(trip.endDate);
  const days      = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isUpcoming = startDate > new Date();
  const isOngoing  = startDate <= new Date() && endDate >= new Date();

  return (
    <div className="anim-in">

      {/* Back */}
      <button onClick={() => router.push('/trips')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Trips
      </button>

      {/* ══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em' }}>{trip.name}</h1>
            <span style={badge(trip.tripType === 'group' ? '#60A5FA' : trip.tripType === 'solo' ? '#A78BFA' : '#34D399', trip.tripType === 'group' ? 'rgba(96,165,250,0.1)' : trip.tripType === 'solo' ? 'rgba(167,139,250,0.1)' : 'rgba(52,211,153,0.1)')}>
              {trip.tripType?.charAt(0).toUpperCase() + trip.tripType?.slice(1)}
            </span>
            {isUpcoming  && <span style={badge('#22C55E','rgba(34,197,94,0.1)')}>Upcoming</span>}
            {isOngoing   && <span style={badge('#F59E0B','rgba(245,158,11,0.1)')}>Ongoing</span>}
            {!isUpcoming && !isOngoing && <span style={badge('#64748B','rgba(100,116,139,0.1)')}>Completed</span>}
            <span style={badge(trip.isPublic ? '#60A5FA' : '#94A3B8', trip.isPublic ? 'rgba(96,165,250,0.06)' : 'rgba(148,163,184,0.06)')}>
              {trip.isPublic ? <><Eye style={{ width: 12, height: 12 }} /> Public</> : <><EyeOff style={{ width: 12, height: 12 }} /> Private</>}
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Created by <span style={{ color: '#94A3B8', fontWeight: 600 }}>{trip.admin?.username || 'unknown'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isMember && (
            <>
              <Link href={`/trips/${tripId}/chat`} style={btn('rgba(79,70,229,0.12)', '#A78BFA')}>
                <MessageCircle style={{ width: 14, height: 14 }} /> Chat
              </Link>
              <Link href={`/trips/${tripId}/wallet`} style={btn('rgba(16,185,129,0.12)', '#34D399')}>
                <Wallet style={{ width: 14, height: 14 }} /> Wallet
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link href={`/trips/${tripId}/edit`}  style={btn('rgba(245,158,11,0.12)', '#FBBF24')}>
                <Pencil  style={{ width: 14, height: 14 }} /> Edit
              </Link>
              <Link href={`/trips/${tripId}/admin`} style={btn('rgba(96,165,250,0.12)', '#60A5FA')}>
                <Settings style={{ width: 14, height: 14 }} /> Admin
              </Link>
              <button onClick={handleDelete} disabled={deleting} style={btn('rgba(239,68,68,0.1)', '#EF4444')}>
                {deleting ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} /> : <Trash2 style={{ width: 14, height: 14 }} />}
                Delete
              </button>
            </>
          )}
          {isMember && !isAdmin && (
            <button onClick={handleLeave} disabled={leaving} style={btn('rgba(239,68,68,0.08)', '#F87171')}>
              {leaving ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} /> : <LogOut style={{ width: 14, height: 14 }} />}
              Leave
            </button>
          )}
        </div>
      </div>

      {/* ══ INFO CARDS ════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: MapPin,    color: '#7C3AED', bg: 'rgba(79,70,229,0.1)',   label: 'Route',    value: `${trip.fromCity} → ${trip.toCity}` },
          { icon: Calendar,  color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',   label: 'Duration', value: `${days} ${days === 1 ? 'day' : 'days'}` },
          { icon: Wallet,    color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Budget',   value: `₹${trip.budget?.toLocaleString('en-IN')}` },
          { icon: Users,     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Members',  value: `${members.length}` },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ DESCRIPTION ══════════════════════════════════════════════════════ */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 10 }}>About this trip</h3>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
          {trip.description || 'No description provided for this trip.'}
        </p>
      </div>

      {/* ══ ITINERARY SECTION ════════════════════════════════════════════════ */}
      <div style={{ ...card, marginBottom: 24 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles style={{ width: 16, height: 16, color: '#f97316' }} />
            AI Itinerary
            {itinerary && <span style={{ fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 20, marginLeft: 4 }}>✓ Saved</span>}
          </h3>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {itinerary && (
              <button
                onClick={() => setShowItinerary(p => !p)}
                style={{ ...btn('rgba(30,41,59,0.8)', '#94a3b8'), padding: '7px 14px', fontSize: 12, border: '1px solid #334155' }}
              >
                {showItinerary ? 'Hide' : 'View'} Itinerary
              </button>
            )}

            {isAdmin && itinerary && !editingItinerary && (
              <button
                onClick={() => { setEditedItinerary(itinerary); setEditingItinerary(true); }}
                style={{ ...btn('rgba(124,58,237,0.15)', '#a78bfa'), padding: '7px 14px', fontSize: 12, border: '1px solid rgba(124,58,237,0.3)' }}
              >
                <Pencil style={{ width: 12, height: 12 }} /> Edit Raw
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => setShowPromptBox(p => !p)}
                  style={{ ...btn(showPromptBox ? 'rgba(34,197,94,0.15)' : 'rgba(30,41,59,0.8)', showPromptBox ? '#4ade80' : '#64748b'), padding: '7px 14px', fontSize: 12, border: `1px solid ${showPromptBox ? 'rgba(34,197,94,0.3)' : '#334155'}` }}
                >
                  ✏️ Instructions
                </button>

                <button
                  onClick={handleGenerateItinerary}
                  disabled={generatingAI}
                  style={{ ...btn(generatingAI ? '#1e293b' : 'rgba(249,115,22,0.15)', generatingAI ? '#475569' : '#fb923c'), padding: '7px 16px', fontSize: 12, border: '1px solid rgba(249,115,22,0.3)' }}
                >
                  {generatingAI
                    ? <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Generating…</>
                    : <><Sparkles style={{ width: 13, height: 13 }} /> {itinerary ? 'Regenerate' : 'Generate with AI'}</>
                  }
                </button>
              </>
            )}
          </div>
        </div>

        {/* Custom Prompt Box */}
        {isAdmin && showPromptBox && (
          <div style={{ marginBottom: 16, padding: 16, background: 'rgba(15,23,42,0.6)', borderRadius: 10, border: '1px solid #1e293b' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 6px', fontWeight: 600 }}>
              ✏️ Extra instructions for AI <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span>
            </p>
            <p style={{ color: '#475569', fontSize: 11, margin: '0 0 10px' }}>
              Example: "Include temple visits", "Budget-friendly dhaba options", "Add adventure activities"
            </p>
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Kuch extra chahiye toh yahan likho…"
              rows={3}
              style={{ width: '100%', borderRadius: 10, padding: '10px 14px', background: 'rgba(15,23,42,0.9)', color: '#e2e8f0', border: '1px solid #334155', fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            {/* Suggestion chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {['🏛️ Historical places','🍜 Street food focus','💸 Budget-friendly','🏔️ Adventure activities','🌿 Nature & trekking','🛕 Temple visits','📸 Photography spots'].map(chip => (
                <button key={chip} onClick={() => setCustomPrompt(p => p ? `${p}, ${chip}` : chip)}
                  style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: 'rgba(30,41,59,0.8)', color: '#64748b', border: '1px solid #334155', cursor: 'pointer' }}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {itineraryError && (
          <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 14 }}>
            {itineraryError}
          </div>
        )}

        {/* Generating spinner */}
        {generatingAI && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Loader2 style={{ width: 28, height: 28, margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#f97316' }} />
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 4px' }}>Groq AI is crafting your itinerary…</p>
            <p style={{ fontSize: 11, color: '#334155' }}>Usually takes 10–20 seconds ☕</p>
          </div>
        )}

        {/* Empty */}
        {!itinerary && !generatingAI && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Sparkles style={{ width: 28, height: 28, margin: '0 auto 10px', opacity: 0.2, color: '#f97316' }} />
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>No itinerary yet</p>
            <p style={{ fontSize: 12, color: '#475569' }}>
              {isAdmin ? 'Click "Generate with AI" to auto-create a day-wise plan' : 'Admin ne abhi itinerary nahi banayi'}
            </p>
          </div>
        )}

        {/* Edit Mode */}
        {editingItinerary && (
          <div>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>⚠️ Raw JSON edit — structure mat todna</p>
            <textarea
              value={editedItinerary}
              onChange={e => setEditedItinerary(e.target.value)}
              rows={18}
              style={{ width: '100%', borderRadius: 10, padding: 14, background: 'rgba(15,23,42,0.9)', color: '#e2e8f0', border: '1px solid #334155', fontSize: 12, lineHeight: 1.7, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditingItinerary(false); setItineraryError(''); }}
                style={{ ...btn('#1e293b', '#94a3b8'), border: '1px solid #334155', padding: '8px 16px' }}>
                <X style={{ width: 13, height: 13 }} /> Cancel
              </button>
              <button onClick={handleSaveItinerary} disabled={savingItinerary}
                style={{ ...btn('#7c3aed'), padding: '8px 18px' }}>
                {savingItinerary ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 13, height: 13 }} />}
                Save to DB
              </button>
            </div>
          </div>
        )}

        {/* ── Structured Itinerary View ── */}
        {itinerary && itineraryData && !editingItinerary && !generatingAI && showItinerary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>

            {/* Summary */}
            <div style={{ padding: '14px 18px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 12 }}>
              <p style={{ color: '#fb923c', fontSize: 11, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✈️ Trip Summary</p>
              <p style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{itineraryData.summary}</p>
            </div>

            {/* Budget Breakdown */}
            {itineraryData.totalBudgetBreakdown && Object.keys(itineraryData.totalBudgetBreakdown).length > 0 && (
              <div style={{ padding: '14px 18px', background: 'rgba(15,23,42,0.4)', borderRadius: 12, border: '1px solid rgba(148,163,184,0.06)' }}>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Budget Breakdown</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  {Object.entries(itineraryData.totalBudgetBreakdown).map(([key, val]) => (
                    <div key={key} style={{ background: 'rgba(30,41,59,0.7)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: 10, margin: '0 0 3px', textTransform: 'capitalize' }}>{key}</p>
                      <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, margin: 0 }}>₹{Number(val).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <ItineraryMapWrapper itineraryData={itineraryData} fromCity={trip.fromCity} toCity={trip.toCity} />

            {/* Day Cards */}
            {itineraryData.days.map(day => (
              <div key={day.day} style={{ borderRadius: 12, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', background: 'rgba(124,58,237,0.1)', borderBottom: '1px solid rgba(124,58,237,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#7c3aed', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Day {day.day}</span>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{day.title}</span>
                  </div>
                  <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700 }}>₹{Number(day.estimated_daily_cost).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(['morning', 'afternoon', 'evening'] as const).map(period => {
                    const slot = day[period] ?? defaultSlot;
                    const meta = periodMeta[period];
                    return (
                      <div key={period} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${meta.color}` }}>
                        <p style={{ color: meta.color, fontSize: 11, fontWeight: 700, margin: '0 0 4px', textTransform: 'capitalize' }}>{meta.icon} {period}</p>
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>{slot.activity}</p>
                        {slot.place && <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 10, height: 10, flexShrink: 0 }} /> {slot.place}</p>}
                        {slot.tip  && <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 3px', fontStyle: 'italic' }}>💡 {slot.tip}</p>}
                        <p style={{ color: '#4ade80', fontSize: 12, margin: 0 }}>~₹{Number(slot.cost).toLocaleString('en-IN')}</p>
                      </div>
                    );
                  })}

                  {/* Meals */}
                  {day.meals && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, background: 'rgba(30,41,59,0.4)', borderRadius: 8, padding: '10px 12px' }}>
                      {Object.entries(day.meals).map(([meal, name]) => (
                        <div key={meal} style={{ textAlign: 'center' }}>
                          <p style={{ color: '#64748b', fontSize: 10, margin: '0 0 2px', textTransform: 'capitalize' }}>
                            {meal === 'breakfast' ? '🍳' : meal === 'lunch' ? '🍱' : '🍽️'} {meal}
                          </p>
                          <p style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600, margin: 0 }}>{name as string}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Transport & Safety */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ color: '#64748b', fontSize: 10, margin: '0 0 3px' }}>🚗 Transport</p>
                      <p style={{ color: '#cbd5e1', fontSize: 12, margin: 0 }}>{day.transport}</p>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <p style={{ color: '#f87171', fontSize: 10, margin: '0 0 3px' }}>🛡️ Safety</p>
                      <p style={{ color: '#cbd5e1', fontSize: 12, margin: 0 }}>{day.safety_tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* General Tips */}
            {itineraryData.general_tips.length > 0 && (
              <div style={{ padding: '14px 18px', background: 'rgba(15,23,42,0.4)', borderRadius: 12, border: '1px solid rgba(148,163,184,0.06)' }}>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 General Tips</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {itineraryData.general_tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'rgba(249,115,22,0.15)', color: '#fb923c', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i+1}</span>
                      <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.6 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {itineraryData.emergency_contacts && Object.keys(itineraryData.emergency_contacts).length > 0 && (
              <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.04)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.12)' }}>
                <p style={{ color: '#f87171', fontSize: 11, fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🆘 Emergency Contacts</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                  {Object.entries(itineraryData.emergency_contacts).map(([key, val]) => (
                    <div key={key} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: 10, margin: '0 0 3px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                      <p style={{ color: '#f87171', fontSize: 14, fontWeight: 700, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback plain text */}
        {itinerary && !itineraryData && !editingItinerary && !generatingAI && showItinerary && (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, color: '#cbd5e1', lineHeight: 1.8, fontFamily: 'inherit', margin: 0, marginTop: 12 }}>
            {itinerary}
          </pre>
        )}
      </div>

      {/* ══ MEMBERS + JOIN ════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Members */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users style={{ width: 16, height: 16 }} /> Members {members.length}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.length === 0
              ? <p style={{ fontSize: 13, color: '#64748B' }}>No members yet</p>
              : members.map((m: any) => {
                  const u           = m.user || m;
                  const memberId    = m.userId || u.id;
                  const isAdminMem  = memberId === trip.adminId || memberId === trip.admin?.id;
                  return (
                    <div key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(148,163,184,0.04)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {u.username ? u.username[0].toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
                          {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.username}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>@{u.username}</p>
                      </div>
                      {isAdminMem && <span style={badge('#F59E0B','rgba(245,158,11,0.1)')}>Admin</span>}
                      {isAdmin && !isAdminMem && (
                        <button onClick={() => handleRemoveMember(memberId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                          <XCircle style={{ width: 16, height: 16, color: '#EF4444' }} />
                        </button>
                      )}
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Join / Quick Actions */}
        <div style={card}>
          {isAdmin ? (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus style={{ width: 16, height: 16 }} /> Join Requests {joinRequests.filter((r:any) => r.status === 'pending').length}
              </h3>
              {joinRequests.filter((r:any) => r.status === 'pending').length === 0
                ? <p style={{ fontSize: 13, color: '#64748B' }}>No pending requests</p>
                : joinRequests.filter((r:any) => r.status === 'pending').map((r:any) => (
                    <div key={r.id} style={{ padding: 12, borderRadius: 10, background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.06)', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: r.message ? 6 : 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>{r.user?.username || 'unknown'}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleRequest(r.id, 'accepted')} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle style={{ width: 16, height: 16, color: '#22C55E' }} />
                          </button>
                          <button onClick={() => handleRequest(r.id, 'rejected')} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle style={{ width: 16, height: 16, color: '#EF4444' }} />
                          </button>
                        </div>
                      </div>
                      {r.message && <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{r.message}</p>}
                    </div>
                  ))
              }
            </>
          ) : !isMember ? (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus style={{ width: 16, height: 16 }} /> Join this Trip
              </h3>
              {hasPendingRequest ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                  <Clock style={{ width: 16, height: 16, color: '#F59E0B' }} />
                  <p style={{ fontSize: 13, color: '#FBBF24', margin: 0 }}>Your join request is pending approval</p>
                </div>
              ) : (
                <>
                  <textarea placeholder="Add a message (optional)..." value={joinMsg} onChange={e => setJoinMsg(e.target.value)} maxLength={200}
                    style={{ width: '100%', height: 80, padding: 12, borderRadius: 10, fontSize: 13, color: '#E2E8F0', background: '#0F172A', border: '1px solid rgba(148,163,184,0.1)', outline: 'none', resize: 'none', marginBottom: 12 }} />
                  <button onClick={handleJoin} disabled={joining}
                    style={{ ...btn('linear-gradient(135deg,#4F46E5,#7C3AED)'), width: '100%', justifyContent: 'center' }}>
                    {joining ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} /> : <Send style={{ width: 14, height: 14 }} />}
                    Request to Join
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield style={{ width: 16, height: 16 }} /> Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { href: `/trips/${tripId}/chat`,   icon: MessageCircle, label: 'Open Group Chat',   color: '#7C3AED' },
                  { href: `/trips/${tripId}/wallet`, icon: Wallet,        label: 'Wallet & Expenses', color: '#10B981' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, background: 'rgba(148,163,184,0.04)', textDecoration: 'none', transition: 'all 0.15s' }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{label}</span>
                    <ChevronRight style={{ width: 14, height: 14, color: '#475569', marginLeft: 'auto' }} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
