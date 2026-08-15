/**
 * Authentication API — the replacement for `base44.auth.*`.
 *
 * Base44 equivalents:
 *   base44.auth.me()              -> getCurrentUser()
 *   base44.auth.isAuthenticated() -> isAuthenticated()
 *   base44.auth.logout(url)       -> logout()
 *   base44.auth.redirectToLogin() -> redirectToLogin()  (routes to /Login)
 *   base44.auth.deleteAccount()   -> deleteAccount()
 */

import { api, refreshSession, setAccessToken, getAccessToken } from './client';

export const LOGIN_PATH = '/Login';

function storeSession(session) {
  setAccessToken(session.access_token);
  return session.user;
}

export async function register({ email, password, fullName }) {
  const session = await api.post('/auth/register', {
    email,
    password,
    full_name: fullName || null,
  });
  return storeSession(session);
}

export async function login({ email, password }) {
  const session = await api.post('/auth/login', { email, password });
  return storeSession(session);
}

/** Restore a session on page load using the httpOnly refresh cookie. */
export async function restoreSession() {
  const session = await refreshSession();
  return session ? session.user : null;
}

export function getCurrentUser() {
  return api.get('/auth/me');
}

export async function isAuthenticated() {
  if (!getAccessToken() && !(await refreshSession())) return false;
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function deleteAccount() {
  try {
    await api.delete('/auth/me');
  } finally {
    setAccessToken(null);
  }
}

/** Send the browser to the login screen, remembering where it came from. */
export function redirectToLogin(returnTo = window.location.pathname + window.location.search) {
  const target = returnTo && returnTo !== LOGIN_PATH ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
  window.location.href = `${LOGIN_PATH}${target}`;
}