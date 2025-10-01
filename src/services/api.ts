import { useUser } from "@/stores/userStore";

// Base URL configurable
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

// --------- Tipos de opciones de cache y respuesta ---------
interface CacheEntry<T = any> {
  value: T;
  expiry: number;          // Momento en ms en que expira completamente
  staleAt?: number;        // Momento en que pasa a estar stale (para SWR)
  swr?: boolean;           // Si se usó stale-while-revalidate
  inflight?: Promise<T>;   // Promesa en curso para dedupe
}

interface GetOptions {
  cacheTTL?: number;       // Tiempo total fresco (ms) (default 60s)
  staleTTL?: number;       // Ventana adicional stale (ms) (default 0 => sin SWR)
  forceRefresh?: boolean;  // Ignora caché y refuerza fetch
  swr?: boolean;           // Atajo: si true y staleTTL no dado => staleTTL = cacheTTL
  noCache?: boolean;       // Desactiva cache para esta petición puntual
  headers?: Record<string, string>; // Headers adicionales
  query?: Record<string, string | number | boolean | undefined | null>; // Parámetros query extra
  timeoutMs?: number;      // Timeout de la petición (default 10s)
}

// --------- Estado interno de cache ---------
const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60_000; // 60s
const DEFAULT_TIMEOUT = 10_000; // 10s

// Hash simple (determinista) para cuerpos (no criptográfico)
const hash = (input: any): string => {
  if (input == null) return '0';
  try {
    const str = typeof input === 'string' ? input : JSON.stringify(input, Object.keys(input).sort());
    let h = 0, i = 0, len = str.length;
    while (i < len) { h = (Math.imul(31, h) + str.charCodeAt(i++)) | 0; }
    return h.toString(16);
  } catch { return '0'; }
};

const getUserId = () => useUser.getState().user?.id ?? null; // dinámico

// Construye URL con query extra segura
const buildURL = (endpoint: string, query?: GetOptions['query']): string => {
  if (!query || Object.keys(query).length === 0) return `${API_URL}/${endpoint}`.replace(/(?<!:)\/+/g, '/');
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    usp.append(k, String(v));
  }
  const base = `${API_URL}/${endpoint}`.replace(/(?<!:)\/+/g, '/');
  return `${base}?${usp.toString()}`;
};

// Fetch con timeout
const timedFetch = async (url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
};

// Registra o reutiliza promesa inflight para deduplicar
const getInflight = <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const entry = cache.get(key);
  if (entry?.inflight) return entry.inflight as Promise<T>;
  const p = fn().finally(() => {
    const latest = cache.get(key);
    if (latest) {
      latest.inflight = undefined;
    }
  });
  if (entry) {
    entry.inflight = p as Promise<any>;
  } else {
    cache.set(key, { value: undefined, expiry: 0, inflight: p as Promise<any> });
  }
  return p;
};

// Invalidate heurística: endpoint raíz (ej. 'products') invalidará todo GET que empiece con ese prefijo
const invalidatePrefix = (prefix: string) => {
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}`;
  for (const key of cache.keys()) {
    if (key.startsWith('GET:')) {
      if (key.includes(`/${normalized}`) || key.startsWith(`GET:${normalized}`)) {
        cache.delete(key);
      }
    }
  }
};

// API principal
export const api = {
  /** Cache utilities (experimental) */
  cache: {
    size: () => cache.size,
    clear: () => cache.clear(),
    getKeys: () => Array.from(cache.keys()),
    invalidate: (pattern: string | RegExp) => {
      for (const key of cache.keys()) {
        if (typeof pattern === 'string') {
          if (key.includes(pattern)) cache.delete(key);
        } else if (pattern.test(key)) {
          cache.delete(key);
        }
      }
    }
  },

  /** GET con caching (TTL + opcional SWR). Compatibilidad: llamadas previas sin options mantienen comportamiento (ahora con cache por default). */
  get: async <T>(endpoint: string, options: GetOptions = {}): Promise<T> => {
    const {
      cacheTTL = DEFAULT_TTL,
      staleTTL,
      forceRefresh,
      swr,
      noCache,
      headers = {},
      query,
      timeoutMs = DEFAULT_TIMEOUT,
    } = options;

    const uid = getUserId();
    const url = buildURL(endpoint, query);
    if (noCache) {
      const res = await timedFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers } }, timeoutMs);
      if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
      return res.json();
    }
    const effectiveStaleTTL = swr && !staleTTL ? cacheTTL : (staleTTL ?? 0);
    const key = `GET:${url}`;
    const now = Date.now();
    const existing = cache.get(key) as CacheEntry<T> | undefined;

    // Si no force y existe entrada
    if (!forceRefresh && existing && existing.value !== undefined) {
      const fresh = now < (existing.expiry - effectiveStaleTTL); // Dentro de ventana fresca
      const isStaleWindow = !fresh && now < existing.expiry;     // Dentro de ventana stale SWR
      if (fresh) {
        return existing.value; // devolver fresco
      }
      if (effectiveStaleTTL > 0 && isStaleWindow) {
        // devolver stale y revalidar en background (una sola vez)
        if (!existing.inflight) {
          existing.inflight = timedFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers } }, timeoutMs)
            .then(async r => {
              if (!r.ok) throw new Error(`GET ${endpoint} failed (revalidate): ${r.status}`);
              const data = await r.json();
              cache.set(key, { value: data, expiry: Date.now() + cacheTTL + effectiveStaleTTL, staleAt: Date.now() + cacheTTL, swr: true });
              return data;
            })
            .catch(err => {
              // No eliminar valor anterior, sólo log
              console.warn('[api][swr] revalidate error', err);
              return existing.value as T;
            })
            .finally(() => {
              const latest = cache.get(key);
              if (latest) latest.inflight = undefined;
            });
        }
        return existing.value; // entregar stale
      }
    }

    // Necesitamos fetch real (no hay cache válido o forceRefresh)
    const doFetch = async () => {
      const res = await timedFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers } }, timeoutMs);
      if (!res.ok) {
        cache.delete(key); // no cachear errores
        throw new Error(`GET ${endpoint} failed: ${res.status}`);
      }
      const data: T = await res.json();
      cache.set(key, {
        value: data,
        expiry: Date.now() + cacheTTL + (effectiveStaleTTL || 0),
        staleAt: effectiveStaleTTL ? Date.now() + cacheTTL : undefined,
        swr: !!effectiveStaleTTL,
      });
      return data;
    };

    return getInflight<T>(key, doFetch);
  },

  post: async <T>(endpoint: string, body: any, headers: Record<string, string> = {}): Promise<T> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
    // invalidar prefijo relacionado (heurística: parte antes del primer '/')
    invalidatePrefix(endpoint.split('/')[0]);
    return res.json();
  },

  postForm: async <T = any>(endpoint: string, formData: FormData, headers: Record<string, string> = {}): Promise<T> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'POST',
      headers: { ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
      body: formData
    });
    if (!res.ok) throw new Error(`POST(form) ${endpoint} failed: ${res.status}`);
    invalidatePrefix(endpoint.split('/')[0]);
    return res.json();
  },

  put: async <T>(endpoint: string, body: any, headers: Record<string, string> = {}): Promise<T> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
    invalidatePrefix(endpoint.split('/')[0]);
    return res.json();
  },

  putForm: async <T = any>(endpoint: string, formData: FormData, headers: Record<string, string> = {}): Promise<T> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'PUT',
      headers: { ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
      body: formData
    });
    if (!res.ok) throw new Error(`PUT(form) ${endpoint} failed: ${res.status}`);
    invalidatePrefix(endpoint.split('/')[0]);
    return res.json();
  },

  patch: async <T>(endpoint: string, body: any, headers: Record<string, string> = {}): Promise<T> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${res.status}`);
    invalidatePrefix(endpoint.split('/')[0]);
    return res.json();
  },

  delete: async (endpoint: string, headers: Record<string, string> = {}): Promise<boolean> => {
    const uid = getUserId();
    const url = buildURL(endpoint, undefined);
    const res = await timedFetch(url, {
      method: 'DELETE',
      headers: { ...(uid ? { 'X-User-Id': uid } : {}), ...headers },
    });
    if (!res.ok) return false;
    invalidatePrefix(endpoint.split('/')[0]);
    return true;
  }
};

// (Opcional) limpieza periódica de entradas completamente expiradas
if (typeof setInterval !== 'undefined') {
  const timer: any = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (entry.expiry < now) cache.delete(key);
    }
  }, 30_000);
  if (typeof timer === 'object' && typeof timer.unref === 'function') {
    timer.unref();
  }
}
