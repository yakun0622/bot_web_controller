export function isRtspUrl(url) {
  const value = url?.trim().toLowerCase() || '';
  return value.startsWith('rtsp://') || value.startsWith('rtsps://');
}

function fetchWithTimeout(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

export function getStoredProxyBase() {
  try {
    return (localStorage.getItem('bot-rtsp-proxy-base') || '').trim().replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function setStoredProxyBase(value) {
  try {
    const next = (value || '').trim().replace(/\/$/, '');
    if (next) localStorage.setItem('bot-rtsp-proxy-base', next);
    else localStorage.removeItem('bot-rtsp-proxy-base');
  } catch {
    // ignore storage errors
  }
}

export function getStoredRtspTransport() {
  try {
    return localStorage.getItem('bot-rtsp-transport') === 'udp' ? 'udp' : 'tcp';
  } catch {
    return 'tcp';
  }
}

export function setStoredRtspTransport(value) {
  try {
    localStorage.setItem('bot-rtsp-transport', value === 'udp' ? 'udp' : 'tcp');
  } catch {
    // ignore storage errors
  }
}

export function buildRtspMjpegUrl(rtspUrl, proxyBase, transport = 'tcp', cacheKey = '') {
  const base = (proxyBase || '').replace(/\/$/, '');
  const params = new URLSearchParams({
    url: rtspUrl.trim(),
    transport: transport === 'udp' ? 'udp' : 'tcp'
  });
  if (cacheKey) params.set('t', String(cacheKey));
  return `${base}/api/rtsp/mjpeg?${params.toString()}`;
}

export async function resolveRtspProxy(preferredBase = '') {
  const custom = (preferredBase || getStoredProxyBase()).trim().replace(/\/$/, '');
  const candidates = [];
  if (custom) {
    candidates.push(custom);
  } else {
    candidates.push('');
    if (typeof window !== 'undefined') {
      candidates.push(`${window.location.protocol}//${window.location.hostname}:8081`);
    }
  }

  const unique = [...new Set(candidates)];
  for (const base of unique) {
    try {
      const response = await fetchWithTimeout(`${base}/api/rtsp/health`);
      const data = await response.json().catch(() => null);
      if (data?.ffmpeg) {
        return { base, ffmpeg: true, status: 'ok' };
      }
      if (data && data.ffmpeg === false) {
        return { base, ffmpeg: false, status: 'no-ffmpeg' };
      }
    } catch {
      // try next candidate
    }
  }

  return { base: null, ffmpeg: false, status: 'offline' };
}
