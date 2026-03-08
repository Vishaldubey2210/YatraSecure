export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

// ── Token Helpers ──
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accesstoken');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshtoken');
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  if (typeof window === 'undefined') return;
  if (!accessToken) {
    console.error('[setTokens] accessToken is undefined — check backend response keys');
    return;
  }
  localStorage.setItem('accesstoken', accessToken);
  localStorage.setItem('refreshtoken', refreshToken ?? '');
  const expiresAt = Date.now() + (Number(expiresIn) || 900) * 1000;
  localStorage.setItem('tokenexpiresat', expiresAt.toString());
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
  localStorage.removeItem('tokenexpiresat');
  localStorage.removeItem('user');
}

// ── Refresh Queue ──
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// ── Refresh Access Token ──
export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve) => addRefreshSubscriber(resolve));
  }

  isRefreshing = true;
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('No refresh token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();

    // ✅ Backend returns: access_token, refresh_token, expires_in
    const newAccessToken  = data.access_token;
    const newRefreshToken = data.refresh_token;
    const expiresIn       = data.expires_in;

    setTokens(newAccessToken, newRefreshToken, expiresIn);
    isRefreshing = false;
    onTokenRefreshed(newAccessToken);
    return newAccessToken;
  } catch (error) {
    isRefreshing = false;
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw error;
  }
}

// ── Fetch With Auth (auto-refresh on 401) ──
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = getAccessToken();

  if (!token) {
    try {
      token = await refreshAccessToken();
    } catch {
      throw new Error('Not authenticated');
    }
  }

  const makeRequest = (t: string) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${t}`,
      },
    });

  let response = await makeRequest(token);

  // Token expire ho gaya — refresh karke retry
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);
    } catch {
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

// ── Proactive Refresh (60s before expiry) ──
if (typeof window !== 'undefined') {
  setInterval(() => {
    const expiresAt = localStorage.getItem('tokenexpiresat');
    if (!expiresAt) return;
    const timeLeft = parseInt(expiresAt) - Date.now();
    if (timeLeft < 60_000 && timeLeft > 0) {
      refreshAccessToken().catch(() => {});
    }
  }, 30_000);
}
