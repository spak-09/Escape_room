import axios from 'axios';

let inMemoryAccessToken = null;

export const setInMemoryAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = () => inMemoryAccessToken;

export const clearInMemoryAccessToken = () => {
  inMemoryAccessToken = null;
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');

export const api = axios.create({
  baseURL: apiBaseUrl,
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
          `${api.defaults.baseURL}/auth/refresh`,
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

    return Promise.reject(error.response?.data?.error || error);
  }
);
