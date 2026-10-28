/**
 * FM Admin Secure API Client
 *
 * Security Architecture:
 * - Never contains hardcoded API keys, database URLs, or Cloudflare credentials.
 * - Authenticates via HTTP-Only SameSite JWT cookies (inaccessible to browser JS inspect tab)
 *   with fallback to in-memory Bearer token.
 * - All backend database connections and third-party storage credentials remain exclusively on the server.
 */

const API_BASE = '/api';

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach in-memory bearer token if present
  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  // If body is FormData (file upload), let browser set multipart boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Includes httpOnly admin_session_token cookie
  });

  if (response.status === 204) {
    return true;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // --- Auth ---
  googleLogin: ({ credential, supabaseToken } = {}) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, supabaseToken }),
    }),

  getMe: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // --- Channels ---
  getChannels: (table = 'tamil') =>
    request(`/channels?table=${encodeURIComponent(table)}`),

  addChannel: (table, channelData) =>
    request(`/channels?table=${encodeURIComponent(table)}`, {
      method: 'POST',
      body: JSON.stringify(channelData),
    }),

  updateChannel: (table, uuid, channelData) =>
    request(`/channels/${encodeURIComponent(uuid)}?table=${encodeURIComponent(table)}`, {
      method: 'PUT',
      body: JSON.stringify(channelData),
    }),

  deleteChannel: (table, uuid) =>
    request(`/channels/${encodeURIComponent(uuid)}?table=${encodeURIComponent(table)}`, {
      method: 'DELETE',
    }),

  // --- Categories ---
  getCategories: (table = 'tamil') =>
    request(`/categories?table=${encodeURIComponent(table)}`),

  // --- Reports ---
  getReports: (table = 'tamil') =>
    request(`/reports?table=${encodeURIComponent(table)}`),

  resolveReport: (table, uuid) =>
    request(`/reports/${encodeURIComponent(uuid)}?table=${encodeURIComponent(table)}`, {
      method: 'DELETE',
    }),

  // --- Version ---
  getVersion: () => request('/version'),

  updateVersion: (versionData) =>
    request('/version', {
      method: 'PUT',
      body: JSON.stringify(versionData),
    }),

  // --- Cloudflare Image Upload ---
  uploadImage: (file, folder = 'tamil') => {
    const formData = new FormData();
    formData.append('image', file);
    return request(`/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      body: formData,
    });
  },

  // --- Admin Access Management ---
  getAdmins: () => request('/auth/admins'),

  addAdmin: (email, name = '') =>
    request('/auth/admins', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  removeAdmin: (email) =>
    request(`/auth/admins/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }),
};
