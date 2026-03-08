'use client';
import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail, Lock, User, Eye, EyeOff,
  ArrowRight, Loader2, AlertCircle,
  Check, X, ShieldCheck,
} from 'lucide-react';
import { API_BASE_URL, setTokens } from '@/app/lib/api';

export default function SignupPage() {
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fe,       setFe]       = useState<Record<string, string>>({});

  const checks = useMemo(() => ({
    len:   password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    num:   /[0-9]/.test(password),
    spec:  /[!@#$%^&*]/.test(password),
  }), [password]);

  const strength = useMemo(() => {
    const p = Object.values(checks).filter(Boolean).length;
    if (p <= 1) return { l: 'Weak',      w: 20,  c: '#EF4444' };
    if (p === 2) return { l: 'Fair',      w: 40,  c: '#F97316' };
    if (p === 3) return { l: 'Good',      w: 60,  c: '#EAB308' };
    if (p === 4) return { l: 'Strong',    w: 80,  c: '#22C55E' };
    return              { l: 'Excellent', w: 100, c: '#4F46E5' };
  }, [checks]);

  function validate(field: string, val: string) {
    if (field === 'username')
      return !val.trim()
        ? 'Required'
        : val.trim().length < 3
        ? 'Min 3 characters'
        : !/^[a-zA-Z0-9_]+$/.test(val.trim())
        ? 'Letters, numbers, _ only'
        : '';
    if (field === 'email')
      return !val.trim()
        ? 'Required'
        : !/\S+@\S+\.\S+/.test(val)
        ? 'Invalid email'
        : '';
    if (field === 'password')
      return !val ? 'Required' : val.length < 8 ? 'Min 8 characters' : '';
    if (field === 'confirm')
      return !val ? 'Required' : val !== password ? "Passwords don't match" : '';
    return '';
  }

  function change(field: string, val: string, setter: (v: string) => void) {
    setter(val);
    if (fe[field]) setFe((p) => ({ ...p, [field]: validate(field, val) }));
    setError('');
  }

  function blur(field: string, val: string) {
    setFe((p) => ({ ...p, [field]: validate(field, val) }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = {
      username: validate('username', username),
      email:    validate('email', email),
      password: validate('password', password),
      confirm:  validate('confirm', confirm),
    };
    setFe(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    email.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message[0]
            : data.message || 'Signup failed',
        );
      }

      // ✅ Backend: access_token, refresh_token, expires_in
      const accessToken  = data.access_token;
      const refreshToken = data.refresh_token;
      const expiresIn    = data.expires_in;

      if (!accessToken) {
        console.error('[Signup] No access_token in response:', data);
        throw new Error('Signup failed — no token received');
      }

      setTokens(accessToken, refreshToken, Number(expiresIn));
      localStorage.setItem('user', JSON.stringify(data.user ?? {}));

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 46, paddingLeft: 42, paddingRight: 16,
    borderRadius: 10, fontSize: 14, color: '#E2E8F0',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid #1e293b',
    outline: 'none', transition: 'border-color 0.15s',
  };
  const inputErr: React.CSSProperties = { ...inputBase, borderColor: '#ef4444' };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#94a3b8', marginBottom: 8,
  };

  return (
    <div className="anim-in">

      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 26, fontWeight: 900, color: 'white',
          letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Create account
        </h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Join thousands of safe travelers across India
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="anim-shake" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <AlertCircle style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0 }} />
          <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 500, margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Username */}
        <div>
          <label style={labelStyle}>Username</label>
          <div style={{ position: 'relative' }}>
            <User style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              width: 15, height: 15, color: '#475569', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={username}
              onChange={(e) => change('username', e.target.value, setUsername)}
              onBlur={(e)  => blur('username', e.target.value)}
              placeholder="johndoe"
              style={fe.username ? inputErr : inputBase}
              autoComplete="username"
              required
            />
          </div>
          {fe.username && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>{fe.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              width: 15, height: 15, color: '#475569', pointerEvents: 'none',
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => change('email', e.target.value, setEmail)}
              onBlur={(e)  => blur('email', e.target.value)}
              placeholder="you@example.com"
              style={fe.email ? inputErr : inputBase}
              autoComplete="email"
              required
            />
          </div>
          {fe.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>{fe.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              width: 15, height: 15, color: '#475569', pointerEvents: 'none',
            }} />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => change('password', e.target.value, setPassword)}
              onBlur={(e)  => blur('password', e.target.value)}
              placeholder="Create a strong password"
              style={{ ...( fe.password ? inputErr : inputBase), paddingRight: 44 }}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#475569', display: 'flex', padding: 0,
              }}
            >
              {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {fe.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>{fe.password}</p>}

          {/* Strength bar */}
          {password && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    transition: 'all 0.4s',
                    width: `${strength.w}%`,
                    background: strength.c,
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: strength.c, minWidth: 56 }}>
                  {strength.l}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
                {([
                  ['len',   '8+ characters'],
                  ['upper', 'Uppercase'],
                  ['lower', 'Lowercase'],
                  ['num',   'Number'],
                  ['spec',  'Special char'],
                ] as const).map(([k, l]) => (
                  <div key={k} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: checks[k] ? '#16a34a' : '#475569',
                  }}>
                    {checks[k]
                      ? <Check style={{ width: 11, height: 11 }} />
                      : <X     style={{ width: 11, height: 11 }} />
                    }
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <ShieldCheck style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              width: 15, height: 15, color: '#475569', pointerEvents: 'none',
            }} />
            <input
              type={showCf ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => change('confirm', e.target.value, setConfirm)}
              onBlur={(e)  => blur('confirm', e.target.value)}
              placeholder="Re-enter your password"
              style={{ ...(fe.confirm ? inputErr : inputBase), paddingRight: 44 }}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCf(!showCf)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#475569', display: 'flex', padding: 0,
              }}
            >
              {showCf ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {fe.confirm && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>{fe.confirm}</p>}
          {confirm && confirm === password && !fe.confirm && (
            <p style={{
              fontSize: 12, color: '#16a34a', marginTop: 5,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Check style={{ width: 12, height: 12 }} /> Passwords match
            </p>
          )}
        </div>

        {/* Terms */}
        <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
          By creating an account, you agree to our{' '}
          <Link href="/terms" style={{ color: '#f97316', textDecoration: 'underline' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: '#f97316', textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 15 }}
        >
          {loading ? (
            <><Loader2 style={{ width: 17, height: 17, animation: 'spin 1s linear infinite' }} /> Creating...</>
          ) : (
            <>Create account <ArrowRight style={{ width: 17, height: 17 }} /></>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#334155', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>

    </div>
  );
}
