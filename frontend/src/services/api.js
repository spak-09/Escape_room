import axios from 'axios';

let inMemoryAccessToken = null;

export const setInMemoryAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = () => inMemoryAccessToken;

export const clearInMemoryAccessToken = () => {
  inMemoryAccessToken = null;
};

/**
 * ROOT CAUSE & INTEGRATION FIX:
 * The backend mounts all authoritative REST endpoints under `/api/v1` (via `app.use('/api/v1', apiRouter)` in `backend/src/app.js`).
 * When `VITE_API_BASE_URL` was configured as `https://escape-room-nmxc.onrender.com` (missing `/api/v1`),
 * requests like `POST /auth/register` bypassed the API router and hit the Express catch-all 404 handler,
 * returning: "Cannot find endpoint POST /auth/register on this server".
 * 
 * To ensure absolute resilience across both development and production, we normalize the base URL
 * so it consistently targets the authoritative API root (/api/v1) and strips any trailing slashes.
 */
export const resolveBaseURL = (rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '') => {
  const defaultUrl = (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ? '/api/v1' : 'http://localhost:5000/api/v1';
  const url = (rawUrl || defaultUrl).trim();
  const stripped = url.replace(/\/+$/, '');
  if (stripped.includes('/api/v1')) {
    return stripped;
  }
  if (stripped.endsWith('/api')) {
    return `${stripped}/v1`;
  }
  return `${stripped}/api/v1`;
};

export const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true, // Required for HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach in-memory Access Token
api.interceptors.request.use((config) => {
  const token = getInMemoryAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Transparent Token Refresh with Queue to prevent duplicate refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data, // Unwraps axios envelope -> { success: true, data: ... }
  async (error) => {
    const originalRequest = error.config;

    // Only retry on 401 if not already retried and not an auth credentials endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL.replace(/\/+$/, '')}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Server returns { success: true, data: { accessToken: "..." } }
        const newAccessToken = refreshResponse.data.data.accessToken;
        setInMemoryAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearInMemoryAccessToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Server error envelope ({ code, message, details }) is passed through as-is
    const apiError = error.response?.data?.error;
    if (apiError) {
      return Promise.reject(apiError);
    }

    // The request left the client but no response arrived (API offline, running
    // on a different port, origin rejected by CORS, DNS/TLS failure). Surface a
    // diagnosable error instead of axios' opaque "Network Error".
    if (error.request) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: `Facility API unreachable at ${api.defaults.baseURL}. Verify the backend is running and that VITE_API_BASE_URL points to it.`,
        details: null,
      });
    }

    return Promise.reject(error);
  }
);
