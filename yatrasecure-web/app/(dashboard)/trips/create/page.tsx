'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, Calendar, Wallet,
  Users, FileText, Globe, Lock, Loader2, Plus,
} from 'lucide-react';
import { API_BASE_URL, getAccessToken } from '@/app/lib/api';

const TRIP_TYPES = [
  { value: 'group',      label: 'Group',      emoji: '👥' },
  { value: 'solo',       label: 'Solo',       emoji: '🧍' },
  { value: 'family',     label: 'Family',     emoji: '👨‍👩‍👧' },
  { value: 'adventure',  label: 'Adventure',  emoji: '🏔️' },
  { value: 'pilgrimage', label: 'Pilgrimage', emoji: '🛕' },
  { value: 'business',   label: 'Business',   emoji: '💼' },
];

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function CreateTripPage() {
  const router = useRouter();

  const [name,        setName]        = useState('');
  const [fromCity,    setFromCity]    = useState('');
  const [toCity,      setToCity]      = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [budget,      setBudget]      = useState('');
  const [tripType,    setTripType]    = useState('group');
  const [description, setDescription] = useState('');
  const [isPublic,    setIsPublic]    = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // ── Validation ──
  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())                          e.name       = 'Trip name is required';
    else if (name.trim().length < 3)           e.name       = 'Minimum 3 characters';
    if (!fromCity.trim())                      e.fromCity   = 'Departure city is required';
    if (!toCity.trim())                        e.toCity     = 'Destination city is required';
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase())
                                               e.toCity     = 'Destination must differ from departure';
    if (!startDate)                            e.startDate  = 'Start date is required';
    if (!endDate)                              e.endDate    = 'End date is required';
    if (startDate && endDate && endDate < startDate)
                                               e.endDate    = 'End date must be after start date';
    if (!budget)                               e.budget     = 'Budget is required';
    else if (isNaN(Number(budget)) || Number(budget) <= 0)
                                               e.budget     = 'Enter a valid positive amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) { router.replace('/login'); return; }

      const res = await fetch(`${API_BASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:        name.trim(),
          fromCity:    fromCity.trim(),
          toCity:      toCity.trim(),
          startDate:   new Date(startDate).toISOString(),
          endDate:     new Date(endDate).toISOString(),
          budget:      Number(budget),
          tripType,
          description: description.trim() || undefined,
          isPublic:    Boolean(isPublic),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Validation errors from backend
        if (res.status === 400 && Array.isArray(data.message)) {
          const be: Record<string, string> = {};
          (data.message as string[]).forEach((msg) => {
            if (msg.toLowerCase().includes('name'))        be.name      = msg;
            else if (msg.toLowerCase().includes('from'))   be.fromCity  = msg;
            else if (msg.toLowerCase().includes('to'))     be.toCity    = msg;
            else if (msg.toLowerCase().includes('start'))  be.startDate = msg;
            else if (msg.toLowerCase().includes('end'))    be.endDate   = msg;
            else if (msg.toLowerCase().includes('budget')) be.budget    = msg;
          });
          setErrors(be);
          toast.error('Please fix the errors');
        } else {
          toast.error(data.message || 'Failed to create trip');
        }
        return;
      }

      toast.success(`Trip "${data.name}" created!`);
      router.push(`/trips/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  // ── Duration preview ──
  const durationDays =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            86400000,
        )
      : null;

  // ── Styles ──
  const inputBase: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: 10, fontSize: 14, color: '#E2E8F0',
    background: '#0F172A',
    border: '1px solid rgba(148,163,184,0.12)',
    outline: 'none', transition: 'border-color 0.15s',
  };
  const inputErr: React.CSSProperties = {
    ...inputBase, borderColor: '#EF4444',
  };

  function inp(field: string): React.CSSProperties {
    return errors[field] ? inputErr : inputBase;
  }

  return (
    <div className="anim-in" style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(148,163,184,0.06)',
            border: '1px solid rgba(148,163,184,0.1)',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: '#94A3B8' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
            Create New Trip
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Plan your next adventure
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Trip Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              Trip Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              style={inp('name')}
              placeholder="e.g., Goa Beach Trip"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              maxLength={100}
              onFocus={e  => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={e   => { e.target.style.borderColor = errors.name ? '#EF4444' : 'rgba(148,163,184,0.12)'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.name && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.name}</p>}
              <p style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>{name.length}/100</p>
            </div>
          </div>

          {/* From → To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                <MapPin style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                From City <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                style={inp('fromCity')}
                placeholder="Delhi"
                value={fromCity}
                onChange={e => { setFromCity(e.target.value); setErrors(p => ({ ...p, fromCity: '' })); }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; }}
                onBlur={e  => { e.target.style.borderColor = errors.fromCity ? '#EF4444' : 'rgba(148,163,184,0.12)'; }}
              />
              {errors.fromCity && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.fromCity}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                <MapPin style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                To City <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                style={inp('toCity')}
                placeholder="Goa"
                value={toCity}
                onChange={e => { setToCity(e.target.value); setErrors(p => ({ ...p, toCity: '' })); }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; }}
                onBlur={e  => { e.target.style.borderColor = errors.toCity ? '#EF4444' : 'rgba(148,163,184,0.12)'; }}
              />
              {errors.toCity && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.toCity}</p>}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                <Calendar style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                Start Date <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                style={{ ...inp('startDate'), colorScheme: 'dark' }}
                min={getTodayStr()}
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, startDate: '' })); }}
              />
              {errors.startDate && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.startDate}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                <Calendar style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                End Date <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                style={{ ...inp('endDate'), colorScheme: 'dark' }}
                min={startDate || getTodayStr()}
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setErrors(p => ({ ...p, endDate: '' })); }}
              />
              {errors.endDate && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.endDate}</p>}
            </div>
          </div>

          {/* Duration preview */}
          {durationDays !== null && durationDays > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 10, background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
            }}>
              <Calendar style={{ width: 14, height: 14, color: '#A78BFA' }} />
              <p style={{ fontSize: 13, color: '#A78BFA', fontWeight: 600 }}>
                {durationDays} day{durationDays !== 1 ? 's' : ''} trip
              </p>
            </div>
          )}

          {/* Budget */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              <Wallet style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
              Total Budget (₹) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: '#64748B', pointerEvents: 'none',
              }}>₹</span>
              <input
                type="number"
                style={{ ...inp('budget'), paddingLeft: 28 }}
                placeholder="50000"
                min="1"
                value={budget}
                onChange={e => { setBudget(e.target.value); setErrors(p => ({ ...p, budget: '' })); }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; }}
                onBlur={e  => { e.target.style.borderColor = errors.budget ? '#EF4444' : 'rgba(148,163,184,0.12)'; }}
              />
            </div>
            {errors.budget && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.budget}</p>}
            {budget && Number(budget) > 0 && !errors.budget && (
              <p style={{ fontSize: 12, color: '#10B981', marginTop: 4 }}>
                ₹{Number(budget).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Trip Type */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
              <Users style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
              Trip Type
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRIP_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTripType(t.value)}
                  style={{
                    padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: tripType === t.value ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : 'transparent',
                    border: `1px solid ${tripType === t.value ? 'transparent' : 'rgba(148,163,184,0.12)'}`,
                    color: tripType === t.value ? 'white' : '#64748B',
                    boxShadow: tripType === t.value ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
              Visibility
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: true,  icon: Globe, label: 'Public',  sub: 'Anyone can find & join', color: '#60A5FA' },
                { val: false, icon: Lock,  label: 'Private', sub: 'Invite code only',        color: '#FBBF24' },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => setIsPublic(opt.val)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                    transition: 'all 0.15s', textAlign: 'left',
                    background: isPublic === opt.val ? `rgba(${opt.val ? '96,165,250' : '251,191,36'},0.08)` : 'transparent',
                    border: `1px solid ${isPublic === opt.val ? (opt.val ? 'rgba(96,165,250,0.3)' : 'rgba(251,191,36,0.3)') : 'rgba(148,163,184,0.1)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <opt.icon style={{ width: 14, height: 14, color: isPublic === opt.val ? opt.color : '#64748B' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: isPublic === opt.val ? opt.color : '#94A3B8' }}>
                      {opt.label}
                    </span>
                    {isPublic === opt.val && (
                      <span style={{
                        marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%',
                        background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg viewBox="0 0 12 12" fill="none" style={{ width: 9, height: 9 }}>
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#475569' }}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              <FileText style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
              Description
              <span style={{ color: '#475569', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
            </label>
            <textarea
              style={{
                ...inputBase, height: 96, padding: '12px 14px',
                resize: 'none', lineHeight: 1.6,
              }}
              placeholder="Tell others about your trip plans..."
              value={description}
              maxLength={500}
              onChange={e => setDescription(e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(148,163,184,0.12)'; }}
            />
            <p style={{ fontSize: 11, color: '#475569', textAlign: 'right', marginTop: 4 }}>
              {description.length}/500
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              color: '#64748B', background: 'rgba(148,163,184,0.06)',
              border: '1px solid rgba(148,163,184,0.1)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, height: 48, borderRadius: 10, fontSize: 15, fontWeight: 700,
              color: 'white', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? '#334155'
                : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            {loading
              ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Creating...</>
              : <><Plus style={{ width: 18, height: 18 }} /> Create Trip</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
