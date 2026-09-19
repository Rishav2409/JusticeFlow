// =====================================================
// AUTH SERVICE
// Manages JWT token + user state in localStorage.
// =====================================================

import api from './api';

const TOKEN_KEY = 'justiceflow_token';
const USER_KEY = 'justiceflow_user';

/**
 * Login with email and password.
 * Calls POST /api/auth/login, stores token + user on success.
 * Returns the response data on success, throws on failure.
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const data = response.data;

  if (data.success && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

/**
 * Logout — clears all auth state from localStorage.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the stored JWT token, or null.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored user object, or null.
 */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Check if a user is currently authenticated (token exists).
 */
export function isAuthenticated() {
  return !!getToken();
}

