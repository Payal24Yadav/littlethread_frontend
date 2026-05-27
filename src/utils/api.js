import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
});

const tokenStorageKey = 'littlethreads_token';
const responseCache = new Map();
const pendingGets = new Map();
let redirectingToLogin = false;

const buildCacheKey = (url, config = {}) => {
  const token = localStorage.getItem(tokenStorageKey) || '';
  const params = config.params ? new URLSearchParams(config.params).toString() : '';
  return [
    'GET',
    url,
    params,
    token ? `auth:${token.slice(0, 24)}` : 'public',
  ].join('|');
};

export const clearApiCache = (matcher) => {
  if (!matcher) {
    responseCache.clear();
    pendingGets.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (matcher(key)) responseCache.delete(key);
  }
  for (const key of pendingGets.keys()) {
    if (matcher(key)) pendingGets.delete(key);
  }
};

export const cachedGet = (url, config = {}) => {
  const { cacheTtl = 60_000, force = false, ...axiosConfig } = config;
  const key = buildCacheKey(url, axiosConfig);
  const cached = responseCache.get(key);

  if (!force && cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.response);
  }

  if (!force && pendingGets.has(key)) {
    return pendingGets.get(key);
  }

  const request = api.get(url, axiosConfig)
    .then((response) => {
      responseCache.set(key, {
        response,
        expiresAt: Date.now() + cacheTtl,
      });
      return response;
    })
    .finally(() => {
      pendingGets.delete(key);
    });

  pendingGets.set(key, request);
  return request;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || '').toLowerCase();
    const isAuthError = status === 401 && (message.includes('token') || message.includes('unauthorized'));

    if (isAuthError && !redirectingToLogin) {
      // Clear local session and force re-login (keeps UI consistent with backend auth).
      redirectingToLogin = true;
      localStorage.removeItem('littlethreads_user');
      localStorage.removeItem(tokenStorageKey);
      clearApiCache();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
