/**
 * HTTP client for the MeetPoint API.
 *
 * Replaces the Base44 SDK. Responsibilities:
 *   - hold the short-lived access token in memory (never localStorage)
 *   - refresh it transparently via the httpOnly cookie on a 401
 *   - normalise errors into ApiError
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

/* -------------------------------------------------------------------------- */
/* Access token store                                                          */
/* -------------------------------------------------------------------------- */

let accessToken = null;
const listeners = new Set();

export const getAccessToken = () => accessToken;

export function setAccessToken(token) {
  accessToken = token || null;
  listeners.forEach((listener) => listener(accessToken));
}

/** Subscribe to token changes (used by AuthContext to react to sign-out). */
export function onAccessTokenChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* -------------------------------------------------------------------------- */
/* Refresh handling                                                            */
/* -------------------------------------------------------------------------- */

let refreshInFlight = null;

/**
 * Exchange the httpOnly refresh cookie for a new access token.
 * Concurrent callers share a single in-flight request.
 */
export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          setAccessToken(null);
          return null;
        }
        const body = await response.json();
        setAccessToken(body.access_token);
        return body;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/* -------------------------------------------------------------------------- */
/* Core request                                                                */
/* -------------------------------------------------------------------------- */

async function parseBody(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return text || null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorMessage(body, response) {
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    if (typeof body.detail === 'string') return body.detail;
    // FastAPI validation errors arrive as a list of {loc, msg, type}.
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail.map((item) => item.msg).filter(Boolean).join(', ');
    }
    if (typeof body.message === 'string') return body.message;
  }
  return `Request failed with status ${response.status}`;
}

async function send(path, { method = 'GET', body, signal, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
}

/**
 * Perform an API request. On a 401 with a usable refresh cookie the token is
 * renewed once and the request replayed.
 */
export async function apiRequest(path, options = {}) {
  const { skipAuthRetry = false, ...rest } = options;

  let response;
  try {
    response = await send(path, rest);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Network error — could not reach the server.', 0, null);
  }

  if (response.status === 401 && !skipAuthRetry && path !== '/auth/refresh') {
    const refreshed = await refreshSession();
    if (refreshed) {
      try {
        response = await send(path, rest);
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        throw new ApiError('Network error — could not reach the server.', 0, null);
      }
    }
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response), response.status, payload);
  }
  return payload;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};