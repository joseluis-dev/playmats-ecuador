// Use environment variable for API URL
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

// Simple in-memory cache for GET requests (short‑lived, per server instance)
interface CacheEntry { t: number; data: any }
const _cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60_000; // 60s

// Helper to build full URL (avoid accidental double slashes)
const buildUrl = (endpoint: string) => `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

// Internal fetch wrapper with timeout + abort
async function timedFetch(input: RequestInfo | URL, init: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10_000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(input, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  /**
   * GET con caché temporal y timeout.
   * Mantiene API retro‑compatible (segundo parámetro opcional).
   */
  get: async <T>(endpoint: string, opts?: { cacheTTL?: number; noCache?: boolean; timeout?: number }): Promise<T> => {
    const cacheTTL = opts?.cacheTTL ?? DEFAULT_TTL;
    const useCache = !opts?.noCache && cacheTTL > 0;
    const key = `GET:${endpoint}`;
    const now = Date.now();
    if (useCache) {
      const hit = _cache.get(key);
      if (hit && now - hit.t < cacheTTL) {
        return hit.data as T;
      }
    }
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'GET',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      timeout: opts?.timeout,
    });
    const data = await response.json();
    if (useCache) _cache.set(key, { t: now, data });
    return data as T;
  },
  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data as T;
  },
  postForm: async (endpoint: string, formData: FormData) => {
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'POST',
      mode: 'cors',
      body: formData
    });
    const data = await response.json();
    return data;
  },
  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'PUT',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data as T;
  },
  putForm: async (endpoint: string, formData: FormData) => {
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'PUT',
      mode: 'cors',
      body: formData
    });
    const data = await response.json();
    return data;
  },
  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await timedFetch(buildUrl(endpoint), {
      method: 'PATCH',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data as T;
  },
  delete: async (endpoint: string) => {
    const response = await timedFetch(buildUrl(endpoint), {
      mode: 'cors',
      method: 'DELETE'
    });
    return response.ok;
  }
};

// Exponer helper para invalidar manualmente si se requiere
export const apiCache = {
  invalidate: (matcher?: (key: string) => boolean) => {
    for (const key of _cache.keys()) {
      if (!matcher || matcher(key)) _cache.delete(key);
    }
  },
  clear: () => _cache.clear(),
  size: () => _cache.size,
};
